import * as THREE from "https://unpkg.com/three@0.158.0/build/three.module.js";
import { entity } from "./Entity.js";

export const ui_controller = (() => {
  class UIController extends entity.Component {
    constructor(_params) {
      super();
      this.params = _params;
      this.visible = true;
    }

    Destroy() {
      if (!this.crosshair_fixed) {
        this.visible = false;
        return;
      }
    }

    InitEntity() {
      this.spriteScale = 0.1;
      this.anim = this.GetComponent("AnimatorController");
      this.followCrosshairTargetPos = new THREE.Vector3(0, 0, -900);
      this.followCrosshairTargetRot = new THREE.Quaternion();
      this.OnCreateSprite();
    }

    OnDeath() {
      this.Destroy();
    }

    OnCreateSprite() {
      if (!this.visible) {
        return;
      }

      // Fixed Crosshair
      const crosshair_fixed = new THREE.TextureLoader().load(
        "./sprites/crosshair_fixed_02.png"
      );
      this.crosshair_fixed = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: crosshair_fixed,
          color: 0xffffff,
          fog: false,
          depthTest: false,
          depthWrite: false,
        })
      );
      this.crosshair_fixed.scale.set(
        this.spriteScale,
        this.spriteScale * this.params.camera.aspect,
        1
      );
      this.crosshair_fixed.position.set(0, 0, -10);

      // Follow Crosshair
      const crosshair_follow = new THREE.TextureLoader().load(
        "./sprites/crosshair_follow_01.png"
      );
      this.crosshair_follow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: crosshair_follow,
          color: 0xffffff,
          fog: false,
          depthTest: false,
          depthWrite: false,
        })
      );
      this.crosshair_follow.scale.set(
        this.spriteScale,
        this.spriteScale * this.params.camera.aspect,
        1
      );
      this.crosshair_follow.position.set(0, 0, -10);

      const threejs =
        this.FindEntity("threeJS").GetComponent("ThreeJSController");
      threejs.uiScene.add(this.crosshair_fixed);
      threejs.uiScene.add(this.crosshair_follow);
    }

    UpdateFollowCrosshair() {
      let vector = new THREE.Vector3();

      // Set gun followcrosshair target
      let targetRot = new THREE.Quaternion();
      this.followCrosshairTargetRot =
        this.gunTarget.getWorldQuaternion(targetRot);

      followCrosshairTargetPos.applyQuaternion(this.gun.quaternion);
      followCrosshairTargetPos.add(this.gunTarget.position);

      followCrosshairTargetPos.getWorldPosition(vector);
      vector.project(camera);

      let pos = new THREE.Vector3(vector.x, vector.y, -1);

      this.crosshair_follow.position.copy(pos);
    }

    Update(timeElapsedS) {
      if (!this.crosshair_fixed) {
        return;
      }

      const camera = this.params.camera;

      const ndc = new THREE.Vector3(0, 0, -1);
      this.crosshair_fixed.position.copy(ndc);

      let vector = new THREE.Vector3();
      this.anim.cube.getWorldPosition(vector);

      vector.project(camera);
      let pos = new THREE.Vector3(vector.x, vector.y, -1);
      this.crosshair_follow.position.copy(pos);

      /* if (this.gunTarget) {
        this.UpdateFollowCrosshair();
      } */
    }
  }

  return {
    UIController: UIController,
  };
})();
