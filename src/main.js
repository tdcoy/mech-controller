import * as THREE from "three";
import { entity } from "./Entity";
import { entity_manager } from "./EntityManager";
import { spawners } from "./Spawner";
import { threejs_controller } from "./ThreeJSController";
import { ammojs_component } from "./AmmoJSComponent";
import { load_controller } from "./LoadController";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

class Demo {
  constructor() {
    this.Init();
  }

  Init() {
    this.entityManager = new entity_manager.EntityManager();
    this.previousRAF = null;

    this.LoadControllers();
    this.RAF();

    const controls = new PointerLockControls(this.camera, document.body);

    // add event listener to show/hide a UI (e.g. the game's menu)
    controls.addEventListener("lock", function () {
      menu.style.display = "none";
    });

    controls.addEventListener("unlock", function () {
      menu.style.display = "block";
    });
  }

  LoadControllers() {
    const threeJS = new entity.Entity();
    threeJS.AddComponent(new threejs_controller.ThreeJSController());
    this.entityManager.Add(threeJS, "threeJS");

    const ammojs = new entity.Entity();
    ammojs.AddComponent(new ammojs_component.AmmoJSController());
    this.entityManager.Add(ammojs, "physics");

    this._ammojs = ammojs.GetComponent("AmmoJSController");
    this._threeJS = threeJS.GetComponent("ThreeJSController");
    this._scene = this._threeJS.scene;
    this._camera = this._threeJS.camera;

    const load = new entity.Entity();
    load.AddComponent(new load_controller.LoadController());
    this.entityManager.Add(load, "loader");

    const basicParams = {
      scene: this._scene,
      camera: this._camera,
    };

    const spawner = new entity.Entity();
    spawner.AddComponent(new spawners.PlayerSpawner(basicParams));
    spawner.AddComponent(new spawners.LevelSpawner(basicParams));
    spawner.AddComponent(new spawners.EnemySpawner(basicParams));

    this.entityManager.Add(spawner, "spawners");

    spawner.GetComponent("PlayerSpawner").Spawn();
    spawner.GetComponent("LevelSpawner").Spawn();
    spawner.GetComponent("EnemySpawner").Spawn({
      scene: this._scene,
      position: new THREE.Vector3(-25, 5, 25),
    });
  }

  RAF() {
    requestAnimationFrame((t) => {
      if (this.previousRAF === null) {
        this.previousRAF = t;
      }

      this.RAF();

      this.Step(t - this.previousRAF);
      this.previousRAF = t;
    });
  }

  Step(timeElapsed) {
    const timeElapsedS = Math.min(1.0 / 30.0, timeElapsed * 0.001);

    this._ammojs.StepSimulation(timeElapsedS);
    this.entityManager.Update(timeElapsedS);
    this._threeJS.Render();
  }
}

let App = null;

window.addEventListener("DOMContentLoaded", () => {
  Ammo().then((lib) => {
    Ammo = lib;
    App = new Demo();
  });
});
