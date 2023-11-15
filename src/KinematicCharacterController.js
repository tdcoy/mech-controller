import { entity } from "./Entity.js";

export const kinematic_character_controller = (() => {
  class KinematicCharacterController extends entity.Component {
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
        .CreateKinematicCharacterController(pos, quat, {
          name: this.Parent.Name,
        });

      this.Parent.Attributes.Physics = {
        CharacterController: this.body,
      };

      this.Broadcast({ topic: "physics.loaded" });
    }

    InitComponent() {
      this.RegisterHandler("update.position", (m) => {
        this.OnPosition(m);
      });
    }

    OnPosition(m) {
      this.OnTransformChanged();
    }

    OnTransformChanged() {
      const pos = this.Parent.Position;
      const quat = this.Parent.Quaternion;
      const t = this.body.transform;

      this.body.body.getWorldTransform(t);

      t.getOrigin().setValue(pos.x, pos.y, pos.z);
      this.body.body.setWorldTransform(t);
    }
  }

  return {
    KinematicCharacterController: KinematicCharacterController,
  };
})();
