import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { math } from "./math";
import { entity } from "./Entity";
import { passes } from "./Passes";

export const third_person_camera = (() => {
  class ThirdPersonCamera extends entity.Component {
    constructor(_params) {
      super();
      this.params = _params;
    }

    Destroy() {}

    InitEntity() {
      this.camera = this.params.camera;
      this.phi = 0;
      this.phiSpeed = 8;
      this.theta = 0;
      this.thetaSpeed = 5;
      this.lerpMultiplier = 1;
      this.targetRot = new THREE.Quaternion();
      this.SetPass(passes.INPUT);
    }

    CalculateRotation(timeElapsedS) {
      const input = this.GetComponent("PlayerInput");
      const xh = input.currentInput.mouseXDelta / window.innerWidth;
      const yh = input.currentInput.mouseYDelta / window.innerHeight;

      this.phi += -xh * this.phiSpeed;
      this.theta = math.Clamp(
        this.theta + -yh * this.thetaSpeed,
        -Math.PI / 4,
        Math.PI / 6
      );

      const qx = new THREE.Quaternion();
      qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi);

      const qz = new THREE.Quaternion();
      qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta);

      const q = new THREE.Quaternion();
      q.multiply(qx);
      q.multiply(qz);

      const t = 1.0 - Math.pow(0.01, 5 * timeElapsedS);
      this.targetRot.slerp(q, t);

      const offset = new THREE.Vector3(0, 14, 20);
      offset.applyQuaternion(this.targetRot);
      offset.add(this.Parent.Position);

      this.camera.position.copy(offset);
      this.camera.quaternion.copy(this.targetRot);
    }

    Update(timeElapsed) {
      this.CalculateRotation(timeElapsed);
    }
  }

  return {
    ThirdPersonCamera: ThirdPersonCamera,
  };
})();
