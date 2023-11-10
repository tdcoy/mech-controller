import * as THREE from "three";
import { entity } from "./Entity";

export const basic_rigid_body = (() => {
  class BasicRigidBody extends entity.Component {
    constructor(_params) {
      super();
      this.params = _params;
    }

    Destroy() {
      this.FindEntity("physics")
        .GetComponent("AmmoJSController")
        .RemoveRigidBody(this.body);
    }

    InitEntity() {
      const pos = this.Parent.Position;
      const quat = this.Parent.Quaternion;

      this.body = this.FindEntity("physics")
        .GetComponent("AmmoJSController")
        .CreateBox(pos, quat, this.params.box, { name: this.Parent.Name });

      if (this.params.scene) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.debug = new THREE.Mesh(geometry, material);
        this.debug.scale.copy(this.params.box);
        this.params.scene.add(this.debug);
      }

      this.Parent.Attributes.roughRadius = Math.max(
        this.params.box.x,
        Math.max(this.params.box.y, this.params.box.z)
      );
      this.Broadcast({ topic: "physics.loaded" });
    }

    InitComponent() {
      this.RegisterHandler("update.position", (m) => {
        this.OnPosition(m);
      });
      this.RegisterHandler("update.rotation", (m) => {
        this.OnRotation(m);
      });
      this.RegisterHandler("physics.collision", (m) => {
        this.OnCollision(m);
      });
    }

    OnCollision() {}

    OnPosition(m) {
      this.OnTransformChanged();
    }

    OnRotation(m) {
      this.OnTransformChanged();
    }

    OnTransformChanged() {
      const pos = this.Parent.Position;
      const quat = this.Parent.Quaternion;

      const ms = this.body.motionState;
      const t = this.body.transform;

      ms.getWorldTransform(t);
      t.setIdentity();
      t.getOrigin().setValue(pos.x, pos.y, pos.z);
      t.getRotation().setValue(quat.x, quat.y, quat.z, quat.w);
      ms.setWorldTransform(t);

      if (this.debug) {
        const origin = pos;
        this.debug.position.copy(origin);
        this.debug.quaternion.copy(quat);
      }
    }

    Update(_) {}
  }

  class CharacterRigidBody extends entity.Component {
    constructor(_params) {
      super();
      this.params = _params;
      this.box = new THREE.Box3();
    }

    Destroy() {
      this.FindEntity("physics")
        .GetComponent("AmmoJSController")
        .RemoveRigidBody(this.body);
    }

    InitEntity() {
      const pos = this.Parent.Position;
      const quat = this.Parent.Quaternion;

      this.body = this.FindEntity("physics")
        .GetComponent("AmmoJSController")
        .CreateBox(pos, quat, this.params.box, { name: this.Parent.Name });

      if (this.params.scene) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.debug = new THREE.Mesh(geometry, material);
        this.debug.scale.copy(this.params.box);
        this.params.scene.add(this.debug);
      }

      this.Parent.Attributes.roughRadius = Math.max(
        this.params.box.x,
        Math.max(this.params.box.y, this.params.box.z)
      );
      this.Broadcast({ topic: "physics.loaded" });
    }

    InitComponent() {
      this.RegisterHandler("update.position", (m) => {
        this.OnPosition(m);
      });
      this.RegisterHandler("update.rotation", (m) => {
        this.OnRotation(m);
      });
      this.RegisterHandler("physics.collision", (m) => {
        this.OnCollision(m);
      });
    }

    OnCollision() {}

    OnPosition(m) {
      this.OnTransformChanged();
    }

    OnRotation(m) {
      this.OnTransformChanged();
    }

    OnTransformChanged() {
      this.box.setFromObject(this.Parent.Attributes.Render.group);

      const quat = this.Parent.Quaternion;
      const ms = this.body.motionState;
      const t = this.body.transform;
      const pos = this.Parent.Position;

      if (!this.box.isEmpty()) {
        this.box.getCenter(pos);
      }

      ms.getWorldTransform(t);
      t.setIdentity();
      t.getOrigin().setValue(pos.x, pos.y, pos.z);
      t.getRotation().setValue(quat.x, quat.y, quat.z, quat.w);
      ms.setWorldTransform(t);

      if (this.debug) {
        const origin = pos;
        this.debug.position.copy(origin);
        this.debug.quaternion.copy(quat);
      }
    }

    Update(_) {}
  }

  return {
    BasicRigidBody: BasicRigidBody,
    CharacterRigidBody: CharacterRigidBody,
  };
})();
