import { finite_state_machine } from "./FiniteStateMachine";
import { player_state } from "./PlayerStates";

export const character_fsm = (() => {
  class CharacterFSM extends finite_state_machine.FiniteStateMachine {
    constructor(_animations) {
      super();
      this.animations = _animations;
      this.Init();
    }

    Init() {
      this.AddState("idle", player_state.IdleState);
      this.AddState("walk", player_state.WalkState);
    }
  }

  return {
    CharacterFSM: CharacterFSM,
  };

})();
