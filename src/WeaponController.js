import * as THREE from "three";
import { entity } from "./Entity";
import { passes } from "./Passes";

export const weapon_controller = (() => {
  const COOL_DOWN = 0.4;

  class WeaponController extends entity.Component {
    constructor(_params) {
      super();

      this.group = new THREE.Group();
      this.params = _params;
      this.coolDown = 0.0;
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
      this.group.parent.remove(this.group);
    }

    InitComponent(){
        this.RegisterHandler('render.visible', (m) => {this.OnVisible(m);});
        this.SetPass(passes.GUN);
    }

    InitEntity(){
        const threejs = this.FindEntity("threeJS").GetComponent("ThreeJSController");
    }


    OnVisible(m){
        this.group.visible = m.value;
    }

    Update(timeElapsedS){
        const input = this.GetComponent("PlayerInput");
        if(!input.isReady()){
            return;
        }

        const fire = input.currentInput.leftButton;

        if(fire){
            this.coolDown = COOL_DOWN;

            const physics = this.FindEntity("physics").GetComponent("AmmoJSController");

            //Need to get projectile spawn point from gun in animatorcontroller
            const projectileSpawn = this.Parent.Forward.clone();
            projectileSpawn.multiplyScalar(100);
            projectileSpawn.add(this.Parent.Position);

            //Need particle effect system
            //const tracer = 
        }
    }
  }

  return { WeaponController: WeaponController };
})();
