//import * as THREE from "three";
import * as THREE from "three";
import { entity } from "./Entity.js";
import { player_input } from "./PlayerInput.js";
import { third_person_camera } from "./ThirdPersonCamera.js";
import { kinematic_character_controller } from "./KinematicCharacterController.js";
import { character_controller } from "./CharacterController.js";
import { level_builder } from "./LevelBuilder.js";
import { animator_controller } from "./AnimatorController.js";
import { ui_controller } from "./UiController.js";
import { health_component } from "./HealthComponent.js";
import { enemy_entity } from "./EnemyController.js";

export const spawners = (() => {
  class PlayerSpawner extends entity.Component {
    constructor(_params) {
      super();
      this.params = _params;
    }

    Spawn() {
      const player = new entity.Entity();
      player.SetPosition(new THREE.Vector3(0, 20, 0));
      player.AddComponent(new player_input.PlayerInput(this.params));
      player.AddComponent(
        new third_person_camera.ThirdPersonCamera(this.params)
      );
      player.AddComponent(
        new character_controller.CharacterController(this.params)
      );
      player.AddComponent(
        new kinematic_character_controller.KinematicCharacterController(
          this.params
        )
      );
      player.AddComponent(
        new animator_controller.AnimatorController(this.params)
      );
      player.AddComponent(new ui_controller.UIController(this.params));
      player.AddComponent(
        new health_component.HealthComponent({
          health: 100,
          maxHealth: 100,
          updateUI: true,
        })
      );

      this.Manager.Add(player, "player");

      return player;
    }
  }

  class LevelSpawner extends entity.Component {
    constructor(_params) {
      super();
      this.params = _params;
    }

    Spawn() {
      const e = new entity.Entity();
      e.SetPosition(new THREE.Vector3(0, 0, 0));
      e.AddComponent(new level_builder.LevelBuilder(this.params));

      this.Manager.Add(e, "levelBuilder");
      return e;
    }
  }

  class EnemySpawner extends entity.Component {
    constructor(_params) {
      super();
      this.params = _params;
    }

    Spawn(params) {
      const e = new entity.Entity();

      e.AddComponent(
        new enemy_entity.EnemyCharacterController({
          scene: this.params.scene,
          model: {
            path: "./models/enemies/",
            name: "drone.glb",
            scale: .75,
          },
        })
      );

      // Rigid Body
      e.AddComponent(
        new kinematic_character_controller.KinematicCharacterController(
          this.params
        )
      );
      e.AddComponent(
        new health_component.HealthComponent({ health: 100, maxHealth: 100 })
      );

      this.Manager.Add(e, "drone");
      e.SetPosition(params.position);
      e.SetActive(true);

      return e;
    }
  }

  return {
    PlayerSpawner: PlayerSpawner,
    LevelSpawner: LevelSpawner,
    EnemySpawner: EnemySpawner,
  };
})();
