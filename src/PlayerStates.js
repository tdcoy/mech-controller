import { player_input } from "./PlayerInput";

export const player_state = (() => {
  class State {
    constructor(_parent) {
      this.parent = _parent;
    }

    Enter() {}
    Exit() {}
    Update() {}
  }

  class IdleState extends State {
    constructor(parent) {
      super(parent);
    }
    get Name() {
      return "idle";
    }

    Enter(prevState) {
      const idleAction = this.parent.animations["idle"].action;
      if (prevState) {
        const prevAction = this.parent.animations[prevState.Name].action;
        idleAction.time = 0.0;
        idleAction.enabled = true;
        idleAction.setEffectiveTimeScale(1.0);
        idleAction.setEffectiveWeight(1.0);
        idleAction.crossFadeFrom(prevAction, 0.5, true);
        idleAction.play();
      } else {
        idleAction.play();
      }
    }

    Exit() {}

    Update(_, input) {
      if (
        input.key(player_input.KEYS.w) ||
        input.key(player_input.KEYS.s) ||
        input.key(player_input.KEYS.a) ||
        input.key(player_input.KEYS.d)
      ) {
        this.parent.SetState("walk");
      }
    }
  }

  class WalkState extends State {
    constructor(parent) {
      super(parent);
    }

    get Name() {
      return "walk";
    }

    Enter(prevState) {
      const curAction = this.parent.animations["walk"].action;

      if (prevState) {
        const prevAction = this.parent.animations[prevState.Name].action;
        curAction.enabled = true;

        //Special conditon of going from run to walk to smooth it better
        if (prevState.Name == "run") {
          const ratio =
            curAction.getClip().duration / prevAction.getClip().duration;
          curAction.time = prevAction.time * ratio;
        } else {
          curAction.time = 0.0;
          curAction.setEffectiveTimeScale(1.0);
          curAction.setEffectiveWeight(1.0);
        }

        curAction.crossFadeFrom(prevAction, 0.5, true);
        curAction.play();
      } else {
        curAction.play();
      }
    }

    Exit() {}

    Update(timeElapsed, input) {
      if (
        input.key(player_input.KEYS.w) ||
        input.key(player_input.KEYS.s) ||
        input.key(player_input.KEYS.d) ||
        input.key(player_input.KEYS.a)
      ) {
        if (input.key(player_input.KEYS.SHIFT_L)) {
          this.parent.SetState("walk");
        }
        return;
      }
      this.parent.SetState("idle");
    }
  }

  /* class RunState extends State {
    constructor(parent) {
      super(parent);
    }
  
    get Name() {
      return "run";
    }
  
    Enter(prevState) {
      const curAction = this.parent.proxy.animations["run"].action;
  
      if (prevState) {
        const prevAction = this.parent.proxy.animations[prevState.Name].action;
  
        curAction.enabled = true;
  
        //Special conditon of going from run to walk to smooth it better
        if (prevState.Name == "walk") {
          const ratio =
            curAction.getClip().duration / prevAction.getClip().duration;
          curAction.time = prevAction.time * ratio;
        } else {
          curAction.time = 0.0;
          curAction.setEffectiveTimeScale(1.0);
          curAction.setEffectiveWeight(1.0);
        }
  
        curAction.crossFadeFrom(prevAction, 0.5, true);
        curAction.play();
      } else {
        curAction.play();
      }
    }
  
    Exit() {}
  
    Update(timeElapsed, input) {
      if (input.move.forward || input.move.background) {
        if (!input.move.shift) {
          this.parent.SetState("walk");
        }
        return;
      }
  
      this.parent.SetState("idle");
    }
  } */

  return {
    State: State,
    WalkState: WalkState,
    IdleState: IdleState,
  };
})();
