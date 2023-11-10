import { entity } from "./Entity";

export const finite_state_machine = (() => {
  class FiniteStateMachine extends entity.Component {
    constructor(params) {
      super();

      this.params = params;
      this.states = {};
      this.currentState = null;
    }

    AddState(name, type) {
      this.states[name] = type;
    }

    SetState(name) {
      const prevState = this.currentState;

      if (prevState) {
        if (prevState.Name == name) {
          return;
        }
        prevState.Exit();
      }
      const state = new this.states[name](this);

      this.currentState = state;
      state.Enter(prevState);
    }

    Update(timeElapsed, input) {
      if (this.currentState) {
        this.currentState.Update(timeElapsed, input);
      }
    }
  }

  

  return {
    FiniteStateMachine: FiniteStateMachine,
  };
})();
