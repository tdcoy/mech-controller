import { entity } from "./Entity";
import { passes } from "./Passes";

export const player_input = (() => {
  const KEYS = {
    a: 65,
    s: 83,
    w: 87,
    d: 68,
    SPACE: 32,
    SHIFT_L: 16,
    CTRL_L: 17,
    ESC: 27,
  };

  class PlayerInput extends entity.Component {
    constructor(_params) {
      super();
      this.params = _params;
    }

    InitEntity() {
      this.currentInput = {
        mouseX: 0,
        mouseY: 0,
        mouseXDelta: 0,
        mouseYDelta: 0,
        leftButton: false,
        rightButton: false,
      };
      this.previous = null;
      this.keys = {};
      this.previousKeys = {};

      document.addEventListener("keydown", (e) => this.OnKeyDown(e), false);
      document.addEventListener("keyup", (e) => this.OnKeyUp(e), false);
      document.addEventListener("mousedown", (e) => this.OnMouseDown(e), false);
      document.addEventListener("mouseup", (e) => this.OnMouseUp(e), false);
      document.addEventListener("mousemove", (e) => this.OnMouseMove(e), false);

      this.Parent.Attributes.Input = {
        Keyboard: {
          Current: this.keys,
          Previous: this.previousKeys,
        },
        Mouse: {
          Current: this.current,
          Previous: this.previous,
        },
      };

      this.SetPass(passes.INPUT);
    }

    OnMouseUp(e) {
      switch (e.button) {
        case 0: {
          this.currentInput.leftButton = false;
          break;
        }
        case 2: {
          this.currentInput.rightButton = false;
          break;
        }
      }
    }

    OnMouseDown(e) {
      switch (e.button) {
        case 0: {
          this.currentInput.leftButton = true;
          break;
        }
        case 2: {
          this.currentInput.rightButton = true;
          break;
        }
      }
    }

    // Mouse movement
    OnMouseMove(e) {
      this.currentInput.mouseX = e.pageX - window.innerWidth / 2;
      this.currentInput.mouseY = e.pageY - window.innerHeight / 2;

      if (this.previous === null) {
        this.previous = { ...this.currentInput };
      }

      this.currentInput.mouseXDelta =
        this.currentInput.mouseX - this.previous.mouseX;
      this.currentInput.mouseYDelta =
        this.currentInput.mouseY - this.previous.mouseY;
    }

    OnKeyDown(e) {
      this.keys[e.keyCode] = true;
    }

    OnKeyUp(e) {
      this.keys[e.keyCode] = false;
    }

    key(keyCode) {
      return !!this.keys[keyCode];
    }

    IsMoving() {
      if (
        this.key(KEYS.w) ||
        this.key(KEYS.s) ||
        this.key(KEYS.a) ||
        this.key(KEYS.d)
      ) {
        return true;
      }
      return false;
    }

    IsReady() {
      return this.previous !== null;
    }

    Update() {
      if (this.previous !== null) {
        this.currentInput.mouseXDelta =
          this.currentInput.mouseX - this.previous.mouseX;
        this.currentInput.mouseYDelta =
          this.currentInput.mouseY - this.previous.mouseY;

        this.previous = { ...this.currentInput };
        this.previousKeys = { ...this.keys };
      }
    }
  }

  return {
    PlayerInput: PlayerInput,
    KEYS: KEYS,
  };
})();
