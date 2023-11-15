import * as THREE from "three";
import { entity } from "./Entity.js";

export const mesh_rigid_body = (() => {
  class MeshRigidBody extends entity.Component {
    constructor(_params) {
      super();
      this.group = new THREE.Group();
      this.params = _params;
    }

    Destroy() {
      this.group.traverse((c) => {
        if (c.material) {
          c.material.dispose();
        }
        if (c.geometry) {
          c.geometry.dispose();
        }
      });
      this.params.scene.remove(this.group);
      this.FindEntity("physics")
        .GetComponent("AmmoJSController")
        .RemoveRigidBody(this.body);
    }

    InitEntity() {
      this.LoadModels();
    }

    LoadModels() {
      const loader = this.FindEntity("loader").GetComponent("LoadController");
      loader.Load(this.params.resourcePath, this.params.resourceName, (mdl) => {
        this.OnLoaded(mdl);
      });
    }

    OnLoaded(obj) {
      this.target = obj.scene;
      this.group.add(this.target);
      this.group.position.copy(this.Parent.Position);
      this.group.quaternion.copy(this.Parent.Quaternion);

      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      this.target.scale.copy(this.params.scale);
      this.target.traverse((c) => {
        if (c.geometry) {
          c.geometry.computeBoundingBox();
        }
        if (c.material) {
          c.material = material;
        }
      });

      this.Broadcast({
        topic: "loaded.collision",
        value: this.target,
      });
    }

    OnMeshLoaded(msg) {
      const target = msg.value;
      const pos = this.Parent.Position;
      const quat = this.Parent.Quaternion;

      this.body = this.FindEntity("physics")
        .GetComponent("AmmoJSController")
        .CreateMesh(target, pos, quat, { name: this.Parent.Name });

      const s = new THREE.Sphere();
      const b = new THREE.Box3().setFromObject(target);
      b.getBoundingSphere(s);
      this.Parent.Attributes.roughRadius = s.radius;

      this.OnTransformChanged();
      this.Broadcast({ topic: "physics.loaded" });
    }

    InitComponent() {
      this.RegisterHandler("loaded.collision", (m) => this.OnMeshLoaded(m));
      this.RegisterHandler("update.position", (m) => {
        this.OnPosition(m);
      });
      this.RegisterHandler("update.rotation", (m) => {
        this.OnRotation(m);
      });
    }

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

      const origin = pos;
      this.group.position.copy(origin);
      this.group.quaternion.copy(quat);
    }

    Update(_) {}
  }

  return {
    MeshRigidBody: MeshRigidBody,
  };
})();
