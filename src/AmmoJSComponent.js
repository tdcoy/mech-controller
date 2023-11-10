import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { entity } from "./Entity";

export const ammojs_component = (() => {
  const flags = {
    CF_STATIC_OBJECT: 1,
    CF_KINEMATIC_OBJECT: 2,
    CF_NO_CONTACT_RESPONSE: 4,
    CF_CUSTOM_MATERIAL_CALLBACK: 8,
    CF_CHARACTER_OBJECT: 16,
  };

  const GRAVITY = 120;

  class AmmoJSKinematicCharacterController {
    constructor() {}

    Destroy() {}

    Init(pos, quat, _userData) {
      const radius = 2;
      const height = 9;

      //Setup Rigidbody paramaters
      this.transform = new Ammo.btTransform();
      this.transform.setIdentity();
      this.transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
      this.transform.setRotation(
        new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
      );

      this.shape = new Ammo.btCapsuleShape(radius, height);
      this.shape.setMargin(0.05);

      this.body = new Ammo.btPairCachingGhostObject();
      this.body.setWorldTransform(this.transform);
      this.body.setCollisionShape(this.shape);
      this.body.setCollisionFlags(flags.CF_CHARACTER_OBJECT);
      this.body.activate(true);

      this.controller = new Ammo.btKinematicCharacterController(
        this.body,
        this.shape,
        0.35,
        1
      );
      this.controller.setUseGhostSweepTest(true);
      this.controller.setUpInterpolate();
      this.controller.setGravity(GRAVITY);
      this.controller.setMaxSlope(Math.PI / 3);
      this.controller.canJump(true);
      this.controller.setJumpSpeed(GRAVITY / 1);
      this.controller.setMaxJumpHeight(100);

      this.userData = new Ammo.btVector3(0, 0, 0);
      this.userData.userData = _userData;
      this.body.setUserPointer(this.userData);

      this.tmpVec3 = new Ammo.btVector3(0, 0, 0);
    }

    SetJumpMultiplier(mult) {
      this.controller.setJumpSpeed((mult * GRAVITY) / 3);
    }

    SetWalkDirection(direction) {
      this.tmpVec3.setValue(direction.x, direction.y, direction.z);
      this.controller.setWalkDirection(this.tmpVec3);
    }

    OnGround() {
      return this.controller.onGround();
    }

    Jump() {
      if (this.controller.onGround()) {
        this.controller.jump();
      }
    }
  }

  class AmmoJSRigidBody {
    constructor() {}

    Destroy() {
      Ammo.destroy(this.body);
      Ammo.destroy(this.info);
      Ammo.destroy(this.shape);
      Ammo.destroy(this.inertia);
      Ammo.destroy(this.motionState);
      Ammo.destroy(this.transform);
      Ammo.destroy(this.userData);

      if (this.mesh) {
        Ammo.destroy(this.mesh);
      }
    }

    InitBox(pos, quat, size, _userData) {
      this.transform = new Ammo.btTransform();
      this.transform.setIdentity();
      this.transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
      this.transform.setRotation(
        new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
      );
      this.motionState = new Ammo.btDefaultMotionState(this.transform);

      let btSize = new Ammo.btVector3(size.x * 0.5, size.y * 0.5, size.z * 0.5);
      this.shape = new Ammo.btBoxShape(btSize);
      this.shape.setMargin(0.05);

      this.inertia = new Ammo.btVector3(0, 0, 0);
      this.info = new Ammo.btRigidBodyConstructionInfo(
        10,
        this.motionState,
        this.shape,
        this.inertia
      );
      this.body = new Ammo.btRigidBody(this.info);

      this.userData = new Ammo.btVector3(0, 0, 0);
      this.userData.userData = _userData;
      this.body.setUserPointer(this.userData);

      Ammo.destroy(btSize);
    }

    InitMesh(src, pos, quat, userData) {
      const A0 = new Ammo.btVector3(0, 0, 0);
      const A1 = new Ammo.btVector3(0, 0, 0);
      const A2 = new Ammo.btVector3(0, 0, 0);

      const V0 = new THREE.Vector3();
      const V1 = new THREE.Vector3();
      const V2 = new THREE.Vector3();

      this.mesh = new Ammo.btTriangleMesh(true, true);

      src.traverse((c) => {
        c.updateMatrixWorld(true);
        if (c.geometry) {
          const p = c.geometry.attributes.position.array;
          for (let i = 0; i < c.geometry.index.count; i += 3) {
            const i0 = c.geometry.index.array[i] * 3;
            const i1 = c.geometry.index.array[i + 1] * 3;
            const i2 = c.geometry.index.array[i + 2] * 3;

            V0.fromArray(p, i0).applyMatrix4(c.matrixWorld);
            V1.fromArray(p, i1).applyMatrix4(c.matrixWorld);
            V2.fromArray(p, i2).applyMatrix4(c.matrixWorld);

            A0.setX(V0.x);
            A0.setY(V0.y);
            A0.setZ(V0.z);
            A1.setX(V1.x);
            A1.setY(V1.y);
            A1.setZ(V1.z);
            A2.setX(V2.x);
            A2.setY(V2.y);
            A2.setZ(V2.z);
            this.mesh.addTriangle(A0, A1, A2, false);
          }
        }
      });

      this.inertia = new Ammo.btVector3(0, 0, 0);
      this.shape = new Ammo.btBvhTriangleMeshShape(this.mesh, true, true);
      this.shape.setMargin(0.05);
      this.shape.calculateLocalInertia(10, this.inertia);

      this.transform = new Ammo.btTransform();
      this.transform.setIdentity();
      this.transform.getOrigin().setValue(pos.x, pos.y, pos.z);
      this.transform.getRotation().setValue(quat.x, quat.y, quat.z, quat.w);
      this.motionState = new Ammo.btDefaultMotionState(this.transform);

      this.info = new Ammo.btRigidBodyConstructionInfo(
        10,
        this.motionState,
        this.shape,
        this.inertia
      );
      this.body = new Ammo.btRigidBody(this.info);

      this.userData_ = new Ammo.btVector3(0, 0, 0);
      this.userData_.userData = userData;
      this.body.setUserPointer(this.userData_);

      Ammo.destroy(A0);
      Ammo.destroy(A1);
      Ammo.destroy(A2);
    }
  }

  class AmmoJSController extends entity.Component {
    constructor() {
      super();
    }

    Destroy() {
      Ammo.Destroy(this.physicsWorld);
      Ammo.Destroy(this.solver);
      Ammo.Destroy(this.broadphase);
      Ammo.Destroy(this.dispatcher);
      Ammo.Destroy(this.collisionConfiguration);
    }

    InitEntity() {
      this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
      this.dispatcher = new Ammo.btCollisionDispatcher(
        this.collisionConfiguration
      );
      this.broadphase = new Ammo.btDbvtBroadphase();
      this.solver = new Ammo.btSequentialImpulseConstraintSolver();
      this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(
        this.dispatcher,
        this.broadphase,
        this.solver,
        this.collisionConfiguration
      );
      this.physicsWorld.setGravity(new Ammo.btVector3(0, -100, 0));

      this.tmpRayOrigin = new Ammo.btVector3();
      this.tmpRayDst = new Ammo.btVector3();
      this.rayCallback = new Ammo.AllHitsRayResultCallback(
        this.tmpRayOrigin,
        this.tmpRayDst
      );
    }

    RayTest(start, end) {
      this.tmpRayOrigin.setValue(start.x, start.y, start.z);
      this.tmpRayDst.setValue(end.x, end.y, end.z);

      this.tmpRayOrigin.setValue(start.x, start.y, start.z);
      this.tmpRayDst.setValue(end.x, end.y, end.z);
      const rayCallback = new Ammo.AllHitsRayResultCallback(
        this.tmpRayOrigin,
        this.tmpRayDst
      );

      this.physicsWorld.rayTest(this.tmpRayOrigin, this.tmpRayDst, rayCallback);

      const hitData = [];
      if (rayCallback.hasHit()) {
        const collisionObjs = rayCallback.get_m_collisionObjects();
        const points = rayCallback.get_m_hitPointWorld();
        const normals = rayCallback.get_m_hitNormalWorld();
        const hits = collisionObjs.size();

        for (let i = 0; i < hits; ++i) {
          const obj = collisionObjs.at(i);
          const ud0 = Ammo.castObject(
            obj.getUserPointer(),
            Ammo.btVector3
          ).userData;

          const point = points.at(i);
          const normal = normals.at(i);

          const p = new THREE.Vector3(point.x(), point.y(), point.z());
          const n = new THREE.Vector3(normal.x(), normal.y(), normal.z());

          hitData.push({
            name: ud0.name,
            position: p,
            normal: n,
            distance: p.distanceTo(start),
          });
        }
      }
    }

    RemoveRigidBody(_body) {
      this.physicsWorld.removeRigidBody(_body.body);
      _body.Destroy();
    }

    CreateKinematicCharacterController(pos, quat, _userData) {
      const controller = new AmmoJSKinematicCharacterController();
      controller.Init(pos, quat, _userData);

      this.physicsWorld.addCollisionObject(controller.body);
      this.physicsWorld.addAction(controller.controller);

      const broadphase = this.physicsWorld.getBroadphase();
      const paircache = broadphase.getOverlappingPairCache();
      paircache.setInternalGhostPairCallback(new Ammo.btGhostPairCallback());

      return controller;
    }

    CreateBox(pos, quat, size, userData) {
      const box = new AmmoJSRigidBody();

      box.InitBox(pos, quat, size, userData);

      this.physicsWorld.addRigidBody(box.body);

      box.body.setActivationState(4);
      box.body.setCollisionFlags(2);

      return box;
    }

    CreateMesh(src, pos, quat, userData) {
      const mesh = new AmmoJSRigidBody();

      mesh.InitMesh(src, pos, quat, userData);

      this.physicsWorld.addRigidBody(mesh.body);

      mesh.body.setActivationState(4);
      mesh.body.setCollisionFlags(2);

      return mesh;
    }

    StepSimulation(timeElapsedS) {
      this.physicsWorld.stepSimulation(timeElapsedS, 10);

      const dispatcher = this.physicsWorld.getDispatcher();
      const numManifolds = this.dispatcher.getNumManifolds();

      const collisions = {};

      for (let i = 0; i < numManifolds; i++) {
        const contactManifold = dispatcher.getManifoldByIndexInternal(i);
        const numContacts = contactManifold.getNumContacts();

        if (numContacts > 0) {
          const rb0 = contactManifold.getBody0();
          const rb1 = contactManifold.getBody1();
          const ud0 = Ammo.castObject(
            rb0.getUserPointer(),
            Ammo.btVector3
          ).userData;
          const ud1 = Ammo.castObject(
            rb1.getUserPointer(),
            Ammo.btVector3
          ).userData;

          if (!(ud0.name in collisions)) {
            collisions[ud0.name] = [];
          }
          collisions[ud0.name].push(ud1.name);

          if (!(ud1.name in collisions)) {
            collisions[ud1.name] = [];
          }
          collisions[ud1.name].push(ud0.name);
        }
      }

      for (let k in collisions) {
        const e = this.FindEntity(k);
        e.Broadcast({ topic: "physics.collision", value: collisions[k] });
      }
    }

    Update(_) {}
  }

  return {
    AmmoJSController: AmmoJSController,
  };
})();
