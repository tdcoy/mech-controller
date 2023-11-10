import * as THREE from "three";
import { player_input } from "./PlayerInput";
import { entity } from "./Entity";
import { passes } from "./Passes";

export const character_controller = (() => {
  const SPRINT_TIME = 5;
  const SPRINT_RECHARGE = 10;

  class CharacterController extends entity.Component {
    constructor(params) {
      super();

      this.params = params;
      this.group = new THREE.Group();
      this.params.scene.add(this.group);
    }

    InitEntity() {
      this.input = this.GetComponent("PlayerInput");
      this.rotation = new THREE.Quaternion();
      this.translation = new THREE.Vector3(0, 0, 0);

      this.walkSpeed = 75;
      this.curWalkSpeed = this.walkSpeed;
      this.sprint = false;
      this.sprintTime = 5;
      this.phi = 0;
      this.phiSpeed = 8;
      this.theta = 0;
      this.thetaSpeed = 5;

      this.moveDirection = new THREE.Vector3();
      this.verticalMovement = 0;
      this.horizontalMovement = 0;

      this.Parent.Attributes.FPSCamera = {
        group: this.group,
      };

      this.SetPass(passes.INPUT);
    }

    UpdateRotation(timeElapsedS) {
      const camera = this.params.camera;
      camera.rotation.order = "YXZ";

      if (
        this.input.key(player_input.KEYS.w) ||
        this.input.key(player_input.KEYS.a) ||
        this.input.key(player_input.KEYS.s) ||
        this.input.key(player_input.KEYS.d)
      ) {
        let targetAngle =
          Math.atan2(this.horizontalMovement, this.verticalMovement) +
          camera.rotation.y;

        let rot = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, targetAngle, 0, "XYZ")
        );

        const t = 1.0 - Math.pow(0.01, 2 * timeElapsedS);
        this.rotation.slerp(rot, t);
      }
    }

    UpdateTranslation(timeElapsedS) {
      const moveDir = this.params.camera.quaternion;

      this.verticalMovement =
        (this.input.key(player_input.KEYS.w) ? 1 : 0) +
        (this.input.key(player_input.KEYS.s) ? -1 : 0);
      this.horizontalMovement =
        (this.input.key(player_input.KEYS.a) ? 1 : 0) +
        (this.input.key(player_input.KEYS.d) ? -1 : 0);

      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(moveDir);
      forward.multiplyScalar(
        this.verticalMovement * timeElapsedS * this.curWalkSpeed
      );

      const left = new THREE.Vector3(-1, 0, 0);
      left.applyQuaternion(moveDir);
      left.multiplyScalar(
        this.horizontalMovement * timeElapsedS * this.curWalkSpeed
      );

      const walk = forward.clone().add(left);

      this.Parent.Attributes.Physics.CharacterController.SetWalkDirection(walk);
      const t =
        this.Parent.Attributes.Physics.CharacterController.body.getWorldTransform();
      const pos = t.getOrigin();
      const pos3 = new THREE.Vector3(pos.x(), pos.y(), pos.z());

      this.translation.lerp(pos3, 0.75);

      if (this.input.key(player_input.KEYS.SPACE)) {
        this.Parent.Attributes.Physics.CharacterController.Jump();
      }

      //Srint
      /* if (input.key(player_input.KEYS.SHIFT_L)) {
        this.powerUp(true);
      } else {
        this.powerUp(false);
      } */
    }

    Update(timeElapsedS) {
      this.UpdateTranslation(timeElapsedS);
      this.UpdateRotation(timeElapsedS);

      this.Parent.SetPosition(this.translation);
    }
  }

  return {
    CharacterController: CharacterController,
  };
})();
