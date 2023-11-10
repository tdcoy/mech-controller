import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { entity } from "./Entity";
import { character_fsm } from "./CharacterFSM";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export const animator_controller = (() => {
  class AnimatorController extends entity.Component {
    constructor(_params) {
      super();

      this.params = _params;
    }

    InitEntity() {
      this.animations = {};
      this.legs = null;
      this.torso = null;
      this.gun = null;
      this.gunLookAtPos = new THREE.Vector3();
      this.gunLookAtRot = new THREE.Quaternion();
      this.stateMachine = new character_fsm.CharacterFSM(this.animations);

      this.LoadPlayerModel();
      this.TestCube();
    }

    TestCube() {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0x02ff00 });
      this.cube = new THREE.Mesh(geometry, material);
      this.params.scene.add(this.cube);
    }

    LoadPlayerModel() {
      //Legs
      const loader = new GLTFLoader();
      loader.setPath("./models/mech/");
      loader.load("mech_legs.glb", (gltf) => {
        const model = gltf.scene;
        this.legs = model;
        this.params.scene.add(this.legs);
        this.torsoPos = model.getObjectByName("Turret");

        model.traverse(function (object) {
          if (object.isMesh) object.castShadow = true;
        });

        const _animations = gltf.animations;
        this.mixer = new THREE.AnimationMixer(this.legs);

        for (let i = 0; i < _animations.length; i++) {
          const clip = _animations[i];
          const action = this.mixer.clipAction(clip);

          this.animations[clip.name] = {
            clip: clip,
            action: action,
          };
        }

        this.stateMachine.SetState("idle");
      });

      //Torso
      const torso = new GLTFLoader();
      torso.setPath("./models/mech/");
      torso.load("mech_torso.glb", (gltf) => {
        const model = gltf.scene;
        this.torso = model;
        this.gunPos = model.getObjectByName("GunPos");
        this.params.scene.add(this.torso);

        model.traverse(function (object) {
          if (object.isMesh) object.castShadow = true;
        });
      });

      // Gun
      const gun = new GLTFLoader();
      gun.setPath("./models/mech/");
      gun.load("mech_gun.glb", (gltf) => {
        const model = gltf.scene;
        this.gun = model;
        this.params.scene.add(this.gun);

        model.traverse(function (object) {
          if (object.isMesh) object.castShadow = true;
        });
      });
    }

    Update(timeElapsedS) {
      const input = this.GetComponent("PlayerInput");
      const camera = this.params.camera;
      camera.rotation.order = "YXZ";
      const t = 1.0 - Math.pow(0.01, 2 * timeElapsedS);

      // Check if models have been loaded
      if (this.legs && this.torso && this.gun) {
        // Set mech legs rotaion
        const offsetPosition = this.Parent.Position.add(
          new THREE.Vector3(0, -6.5, 0)
        );
        this.legs.position.copy(offsetPosition);

        this.legsRot = new THREE.Quaternion();
        this.legsRot = this.GetComponent("CharacterController").rotation;
        this.legs.quaternion.copy(this.legsRot);

        // Set mech torso position and rotation
        let legsTorsoPos = new THREE.Vector3();
        this.torso.position.copy(this.torsoPos.getWorldPosition(legsTorsoPos));

        this.torsolegsRot = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, camera.rotation.y, 0, "XYZ")
        );
        this.torso.quaternion.slerp(this.torsolegsRot, t);

        //Set gun position and rotation
        let legsGunRot = new THREE.Quaternion();
        this.gun.quaternion.slerp(camera.getWorldQuaternion(legsGunRot), t);

        let legsGunPos = new THREE.Vector3();
        this.gun.position.copy(this.gunPos.getWorldPosition(legsGunPos));

        let cubeRot = new THREE.Quaternion();
        this.cube.quaternion.copy(this.gun.getWorldQuaternion(cubeRot));

        const cubeOffset = new THREE.Vector3(0, 0, -5000);
        cubeOffset.applyQuaternion(this.gun.quaternion);
        cubeOffset.add(this.gun.position);
        this.cube.position.copy(cubeOffset);
      }

      // Animation mixer
      if (this.mixer) {
        this.mixer.update(timeElapsedS);
      }

      // Character FSM
      this.stateMachine.Update(timeElapsedS, input);
    }
  }

  return {
    AnimatorController: AnimatorController,
  };
})();
