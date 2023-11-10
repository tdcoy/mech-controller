import * as THREE from "three";
import { entity } from "./Entity";
import { render_component } from "./RenderComponent";
import { basic_rigid_body } from "./BasicRigidBody";
import { mesh_rigid_body } from "./MeshRigidBody";

export const level_builder = (() => {
  class LevelBuilder extends entity.Component {
    constructor(_params) {
      super();
      this.params = _params;
      this.spawned = false;
      this.materials = {};
    }

    LoadTerrain() {
      //Ground
      const ground = new THREE.Mesh(
        new THREE.BoxGeometry(100, 20, 100),
        new THREE.MeshStandardMaterial({
          color: 0x808080,
        })
      );
      ground.castShadow = true;
      ground.receiveShadow = true;
      ground.position.set(0, 0, 0);

      this.FindEntity("loader")
        .GetComponent("LoadController")
        .AddModel(ground, "built-in.", "ground");
    }

    Update(timeElapsed) {
      if (this.spawned) {
        return;
      }

      this.spawned = true;

      /* this.LoadTerrain();

      const e = new entity.Entity();
      e.AddComponent(
        new render_component.RenderComponent({
          scene: this.params.scene,
          resourcePath: "built-in.",
          resourceName: "ground",
          scale: new THREE.Vector3(100, 20, 100),
          emissive: new THREE.Color(0x000000),
          color: new THREE.Color(0x6773a8),
        })
      );
      e.AddComponent(
        new basic_rigid_body.BasicRigidBody({
          box: new THREE.Vector3(100, 20, 100),
        })
      );
      
this.Manager.Add(e, "ground");
      e.SetPosition(new THREE.Vector3(0, -12, 0));
      e.SetActive(false);

      */

      /* const box = new entity.Entity();
      box.AddComponent(
        new render_component.RenderComponent({
          scene: this.params.scene,
          resourcePath: "built-in.",
          resourceName: "box",
          scale: new THREE.Vector3(2, 2, 2),
          emissive: new THREE.Color(0x000000),
          color: new THREE.Color(0x6773a8),
        })
      );
      box.AddComponent(
        new basic_rigid_body.BasicRigidBody({
          box: new THREE.Vector3(2, 2, 2),
        })
      );

      this.Manager.Add(box, "box");
      box.SetPosition(new THREE.Vector3(0, 3, 0));
      box.SetActive(false); */

      // Terain test
      const terrain = new entity.Entity();
      terrain.SetPosition(new THREE.Vector3(0, 0, 0));
      //terrain.SetActive(false);

      terrain.AddComponent(
        new render_component.RenderComponent({
          scene: this.params.scene,
          resourcePath: "../models/terrain/",
          resourceName: "level_test.glb",
          scale: new THREE.Vector3(1, 1, 1),
          emissive: new THREE.Color(0x000000),
          color: new THREE.Color(0xffffff),
        })
      );

      terrain.AddComponent(
        new mesh_rigid_body.MeshRigidBody({
          scene: this.params.scene,
          resourcePath: "../models/terrain/",
          resourceName: "level_test.glb",
          scale: new THREE.Vector3(1, 1, 1),
        })
      );

      this.Manager.Add(terrain);

      // Prop
      const crate = new entity.Entity();
      crate.SetPosition(new THREE.Vector3(3, 0, -40));
      //terrain.SetActive(false);

      crate.AddComponent(
        new render_component.RenderComponent({
          scene: this.params.scene,
          resourcePath: "../models/props/",
          resourceName: "crate_large_stack01.glb",
          scale: new THREE.Vector3(1, 1, 1),
          emissive: new THREE.Color(0x000000),
          color: new THREE.Color(0xffffff),
        })
      );

      crate.AddComponent(
        new mesh_rigid_body.MeshRigidBody({
          scene: this.params.scene,
          resourcePath: "../models/props/",
          resourceName: "crate_large_stack01_col.glb",
          scale: new THREE.Vector3(1, 1, 1),
        })
      );

      this.Manager.Add(crate);
    }
  }

  return { LevelBuilder: LevelBuilder };
})();
