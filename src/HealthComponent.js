import {entity} from "./Entity.js";


export const health_component = (() => {

  class HealthComponent extends entity.Component {
    constructor(_params) {
      super();
      this.stats = {..._params};
    }

    InitComponent() {
      this.RegisterHandler(
          'shot.hit', (m) => this.OnDamage(m));
      this.RegisterHandler(
          'health.add-experience', (m) => this.OnAddExperience(m));

      this.UpdateUI();
    }

    InitEntity() {
      this.Parent.Attributes.Stats = this.stats;
    }

    IsAlive() {
      return this.stats.health > 0;
    }

    get Health() {
      return this.stats.health;
    }

    UpdateUI() {
      if (!this.stats.updateUI) {
        return;
      }

      const bar = document.getElementById('health-bar');

      // const healthAsPercentage = this.stats.health / this.stats.maxHealth;
      // bar.style.width = Math.floor(200 * healthAsPercentage) + 'px';

      // document.getElementById('stats-strength').innerText = this.stats.strength;
      // document.getElementById('stats-wisdomness').innerText = this.stats.wisdomness;
      // document.getElementById('stats-benchpress').innerText = this.stats.benchpress;
      // document.getElementById('stats-curl').innerText = this.stats.curl;
      // document.getElementById('stats-experience').innerText = this.stats.experience;
    }

    ComputeLevelXPRequirement() {
      const level = this.stats.level;
      // Blah just something easy
      const xpRequired = Math.round(2 ** (level - 1) * 100);
      return xpRequired;
    }

    OnAddExperience(msg) {
      this.stats.experience += msg.value;
      const requiredExperience = this.ComputeLevelXPRequirement();
      if (this.stats.experience < requiredExperience) {
        return;
      }

      this.stats.level += 1;
      this.stats.strength += 1;
      this.stats.wisdomness += 1;
      this.stats.benchpress += 1;
      this.stats.curl += 2;

      const spawner = this.FindEntity(
          'level-up-spawner').GetComponent('LevelUpComponentSpawner');
      spawner.Spawn(this.Parent.Position);

      this.Broadcast({
          topic: 'health.levelGained',
          value: this.stats.level,
      });

      this.UpdateUI();
    }

    OnDeath() {
      this.Broadcast({
          topic: 'health.death',
      });
    }

    OnHealthChanged() {
      if (this.stats.health == 0) {
        this.OnDeath();
      }

      this.Broadcast({
        topic: 'health.update',
        health: this.stats.health,
        maxHealth: this.stats.maxHealth,
      });

      this.UpdateUI();
    }

    OnDamage(msg) {
      const oldHealth = this.stats.health;
      this.stats.health = Math.max(0.0, this.stats.health - 25);

      if (oldHealth != this.stats.health) {
        this.OnHealthChanged();
      }
    }
  };

  return {
    HealthComponent: HealthComponent,
  };

})();