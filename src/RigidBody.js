export const rigid_body = (() => {
  class RigidBody {
    constructor() {}

    CreateBox(mass, pos, quat, size) {
      this.transform = new Ammo.btTransform();
      this.transform.setIdentity();
      this.transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
      this.transform.setRotation(
        new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
      );
      this.motionState = new Ammo.btDefaultMotionState(this.transform);

      const btSize = new Ammo.btVector3(
        size.x * 0.5,
        size.y * 0.5,
        size.z * 0.5
      );
      this.shape = new Ammo.btBoxShape(btSize);
      this.shape.setMargin(0.05);

      this.inertia = new Ammo.btVector3(0, 0, 0);

      if (mass > 0) {
        this.shape.calculateLocalInertia(mass, this.inertia);
      }

      this.info = new Ammo.btRigidBodyConstructionInfo(
        mass,
        this.motionState,
        this.shape,
        this.inertia
      );
      this.body = new Ammo.btRigidBody(this.info);

      Ammo.destroy(btSize);
    }
  }

  return { RigidBody: RigidBody };
})();
