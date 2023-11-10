import * as THREE from "three";
import { entity } from "./Entity.js";
import { enemy_state } from "./EnemyState.js";
import { finite_state_machine } from "./FiniteStateMachine.js";

export const enemy_entity = (() => {

  class EnemyFSM extends finite_state_machine.FiniteStateMachine {
    constructor(_animations) {
      super();
      this.animations = _animations;
      this.Init();
    }

    Init() {
      this.AddState("idle", enemy_state.IdleState);
      this.AddState("walk", enemy_state.WalkState);
      //this.AddState("death", player_state.DeathState);
      //this.AddState("shoot", player_state.AttackState);
    }
  }

  class EnemyCharacterController extends entity.Component {
    constructor(_params) {
      super();
      this.params = _params;
    }

    InitEntity() {
      this.Init();
    }

    Init() {
      this.decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
      this.acceleration = new THREE.Vector3(1, 0.125, 100.0);
      this.velocity = new THREE.Vector3(0, 0, 0);
      this.group = new THREE.Group();
      this.lookAtTarget = null;

      this.params.scene.add(this.group);
      this.animations = {};

      this.Parent.Attributes.Render = {
        group: this.group,
      };
      this.Parent.Attributes.NPC = true;
      this.LoadModels();
      this.LoadLookAtTarget();
    }

    InitComponent() {
      this.RegisterHandler("health.death", (m) => {
        this.OnDeath(m);
      });
      this.RegisterHandler("update.position", (m) => {
        this.OnUpdatePosition(m);
      });
      this.RegisterHandler("update.rotation", (m) => {
        this.OnUpdateRotation(m);
      });
    }

    OnUpdatePosition(msg) {
      this.group.position.copy(msg.value);
    }

    OnUpdateRotation(msg) {
      this.group.quaternion.copy(msg.value);
    }

    OnDeath(msg) {
      this.stateMachine.SetState("death");
    }

    LoadModels() {
      const loader = this.FindEntity("loader").GetComponent("LoadController");
      loader.Load(this.params.model.path, this.params.model.name, (glb) => {
        this.target = glb.scene;

        this.group.add(this.target);
        this.target.scale.setScalar(this.params.model.scale);
        this.target.position.set(0,5,0)

        this.bones = {};
        this.target.traverse((c) => {
          if (!c.skeleton) {
            return;
          }
          for (let b of c.skeleton.bones) {
            this.bones[b.name] = b;
          }
        });

        this.target.traverse((c) => {
          c.castShadow = true;
          c.receiveShadow = true;
        });

        this.mixer = new THREE.AnimationMixer(this.target);

        const FindAnim = (animName) => {
          for (let i = 0; i < glb.animations.length; i++) {
            if (glb.animations[i].name.includes(animName)) {
              const clip = glb.animations[i];
              const action = this.mixer.clipAction(clip);
              return {
                clip: clip,
                action: action,
              };
            }
          }
          return null;
        };

        this.animations["idle"] = FindAnim("idle");
        this.animations["walk"] = FindAnim("walk");
        this.animations["death"] = FindAnim("death");

        this.stateMachine = new EnemyFSM(this.animations);

        if (this.queuedState) {
          this.stateMachine.SetState(this.queuedState);
          this.queuedState = null;
        } else {
          this.stateMachine.SetState("idle");
        }

        this.Broadcast({
          topic: "load.character",
          model: this.group,
          bones: this.bones,
        });
      });
    }

    LoadLookAtTarget() {
      const geometry = new THREE.BoxGeometry(0, 0, 0);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      this.lookAtTarget = new THREE.Mesh(geometry, material);
      this.params.scene.add(this.lookAtTarget);
      //this.lookAtTarget.position.copy(this.Parent.Position);
      this.group.add(this.lookAtTarget);
    }

    FindPlayer() {
      const player = this.FindEntity("player");

      const dir = player.Position.clone();
      dir.sub(this.Parent.Position);
      dir.y = 0;
      return dir;
    }

    UpdateAI(timeElapsedS) {
      const toPlayer = this.FindPlayer();      
      const player = this.FindEntity("player");

      if (toPlayer.length() == 0 || toPlayer.length() > 75) {
        this.stateMachine.SetState("idle");
        this.Parent.Attributes.Physics.CharacterController.SetWalkDirection(
          new THREE.Vector3(0, 0, 0)
        );
        return;
      }

      this.lookAtTarget.rotation.order = "YXZ";
      this.lookAtTarget.lookAt(player.Position);

      const targetRot = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, this.lookAtTarget.rotation.y - Math.PI, 0, "XYZ")
      );

      const t = 1.0 - Math.pow(0.01, .5 * timeElapsedS);
      this.target.quaternion.copy(targetRot, t);

      if (toPlayer.length() < 20) {
        this.stateMachine.SetState("idle");
        this.Parent.Attributes.Physics.CharacterController.SetWalkDirection(
          new THREE.Vector3(0, 0, 0)
        );
        return;
      }

      const forwardVelocity = 8;
      const strafeVelocity = 0;

      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(this.lookAtTarget.quaternion);
      forward.multiplyScalar(forwardVelocity * timeElapsedS * 2);

      const left = new THREE.Vector3(-1, 0, 0);
      left.applyQuaternion(this.lookAtTarget.quaternion);
      left.multiplyScalar(strafeVelocity * timeElapsedS * 2);

      this.walk = forward.clone().add(left);

      this.Parent.Attributes.Physics.CharacterController.SetWalkDirection(
        this.walk
      );
      this.stateMachine.SetState("walk");
    }

    Update(timeInSeconds) {
      if (!this.stateMachine) {
        return;
      }

      this.stateMachine.Update(timeInSeconds);

      if (this.mixer) {
        this.mixer.update(timeInSeconds);
      }

      // HARDCODED
      /* if (this.stateMachine.currentState.action) {
        this.Broadcast({
          topic: "player.action",
          action: this.stateMachine.currentState.Name,
          time: this.stateMachine.currentState.action.time,
        });
      } */

      /* switch (this.stateMachine.State) {
        case "idle": {
          this.UpdateAI(timeInSeconds);
          break;
        }
        case "walk": {
          this.UpdateAI(timeInSeconds);
          break;
        }
        case "death": {
          this.Parent.Attributes.Physics.CharacterController.SetWalkDirection(
            new THREE.Vector3(0, 0, 0)
          );
          break;
        }
      } */

      this.UpdateAI(timeInSeconds);

      const t =
        this.Parent.Attributes.Physics.CharacterController.body.getWorldTransform();
      const pos = t.getOrigin();
      const pos3 = new THREE.Vector3(pos.x(), pos.y(), pos.z());

      this.Parent.SetPosition(pos3);
    }
  }

  return {
    EnemyFSM: EnemyFSM,
    EnemyCharacterController: EnemyCharacterController,
  };
})();
