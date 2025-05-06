<template>
  <div>
    <!-- Sección de configuración -->
    <section v-if="currentScreen === 'setup'" class="setup-container">
      <h2 class="setup-title">Configuració dels Jugadors</h2>
      <p class="setup-instruccions">
        Introdueix els noms dels jugadors per començar el joc.
      </p>
      <div class="toggle-container">
        <label for="two-players-toggle">Dos Jugadors:</label>
        <label class="switch">
          <input type="checkbox" v-model="isTwoPlayers" />
          <span class="slider round"></span>
        </label>
      </div>
      <div class="player-input-group">
        <label for="player1-name" class="player-label">Nom del Jugador 1:</label>
        <input type="text" v-model="player1Name" class="player-input" required />
      </div>
      <div class="player-input-group" v-if="isTwoPlayers">
        <label for="player2-name" class="player-label">Nom del Jugador 2:</label>
        <input type="text" v-model="player2Name" class="player-input" required />
      </div>
      <button @click="startGame" class="setup-button">Següent</button>
    </section>

    <!-- Sección de selección d'equip -->
    <section v-if="currentScreen === 'teamSelection'" id="team-selection-section">
      <h2>Selecciona el teu Equip</h2>
      <h2>{{ currentPlayerSelectionMessage }}</h2>
      <h2 id="credits-display">
        Crèdits restants: <span id="credits-value">{{ creditsDisplay }}</span>
      </h2>
      <div id="team-section">
        <h2 id="current-player-selection">{{ currentPlayerSelectionDisplay }}</h2>
        <div id="selected-team-grid" class="grid-container">
          <pokemon-card
            v-for="(poke, index) in currentPlayerTeam"
            :key="index"
            :pokemon="poke"
            :is-selected="isPokemonInTeam(poke.name)"
            @toggle-selection="handleToggleSelection"
          />
        </div>
      </div>
      <button id="next-player-button" @click="handleNextPlayer">
        {{ buttonLabel }}
      </button>
      <!-- Opciones d'ordenació -->
      <div id="sort-options-section">
        <h2>Opcions d'Ordenació</h2>
        <form id="sort-options-form">
          <fieldset>
            <legend>Ordena per:</legend>
            <label>
              <input
                type="radio"
                name="sort-criteria"
                value="name"
                v-model="sortCriteria"
              />
              Nom
            </label>
            <label>
              <input
                type="radio"
                name="sort-criteria"
                value="points"
                v-model="sortCriteria"
              />
              Punts
            </label>
            <label>
              <input
                type="radio"
                name="sort-criteria"
                value="type"
                v-model="sortCriteria"
              />
              Tipus
            </label>
          </fieldset>
          <fieldset>
            <legend>Mètode d'ordenació:</legend>
            <label>
              <input
                type="radio"
                name="sort-method"
                value="bubble"
                v-model="sortMethod"
              />
              Bombolla
            </label>
            <label>
              <input
                type="radio"
                name="sort-method"
                value="insertion"
                v-model="sortMethod"
              />
              Inserció
            </label>
            <label>
              <input
                type="radio"
                name="sort-method"
                value="selection"
                v-model="sortMethod"
              />
              Selecció
            </label>
          </fieldset>
          <button type="button" id="sort-team" @click="handleSortOptions">
            Ordenar
          </button>
        </form>
      </div>
      <div id="pokemon-grid" class="grid-container">
        <pokemon-card
          v-for="(poke, index) in globalPokemonList"
          :key="index"
          :pokemon="poke"
          :is-selected="isPokemonInTeam(poke.name)"
          @toggle-selection="handleToggleSelection"
        />
      </div>
    </section>

    <!-- Sección de batalla: Arena y control del combate -->
    <section v-if="currentScreen === 'battle'" id="battle-arena-section">
      <div class="battle-container">
        <!-- Pokémon 1 -->
        <div id="pokemon1-display">
          <div v-if="currentPokemon1" class="pokemon-card">
            <img
              :src="'../../images/' + formatImageName(currentPokemon1.name)"
              :alt="currentPokemon1.name"
            />
            <h3>{{ currentPokemon1.name }}</h3>
            <p>💥 Poder Especial: {{ currentPokemon1.special_power }}</p>
          </div>
        </div>

        <!-- VS Text -->
        <p class="vs-text">VS</p>

        <!-- Pokémon 2 -->
        <div id="pokemon2-display">
          <div v-if="currentPokemon2" class="pokemon-card">
            <img
              :src="'../../images/' + formatImageName(currentPokemon2.name)"
              :alt="currentPokemon2.name"
            />
            <h3>{{ currentPokemon2.name }}</h3>
            <p>💥 Poder Especial: {{ currentPokemon2.special_power }}</p>
          </div>
        </div>

        <!-- Battle Log -->
        <div class="battle-log-container">
          <h2>Registre de la Batalla</h2>
          <div id="battle-log">
            <p v-for="(log, index) in battleLog" :key="index">{{ log }}</p>
          </div>
        </div>
      </div>
    </section>

    <section v-if="currentScreen === 'battle'" id="battle-section">
      <h2>Moment de la Batalla!</h2>
      <p id="current-turn-display">És el torn de: {{ currentTurn }}</p>
      <button
        id="perform-attack-button"
        @click="performAttack"
        :disabled="!battleInProgress"
      >
        Atacar!
      </button>
    </section>
  </div>
</template>

<script>
import PokemonCard from "./components/PokemonCard.vue";
import { PokemonTeamViewModel } from "./model_view/viewModel.js";

export default {
  name: "App",
  components: {
    "pokemon-card": PokemonCard,
  },
  data() {
    return {
      currentScreen: "setup",
      isTwoPlayers: true,
      player1Name: "",
      player2Name: "",
      currentPlayerSelectionMessage: "",
      currentPlayerSelectionDisplay: "",
      sortCriteria: "",
      sortMethod: "",
      globalPokemonList: [],
      buttonLabel: "Següent Jugador",
      battleLog: [],
      battleInProgress: false,
      currentTurn: "",
      currentPokemon1: null,
      currentPokemon2: null,
      viewModel: new PokemonTeamViewModel(),
    };
  },
  methods: {
    startGame() {
      if (!this.player1Name || (this.isTwoPlayers && !this.player2Name)) {
        alert("Si us plau, introdueix els noms de tots els jugadors.");
        return;
      }
      if (!this.isTwoPlayers) {
        this.player2Name = "CPU";
      }
      console.log(`Jugador 1: ${this.player1Name}, Jugador 2: ${this.player2Name}`);
      this.startTeamSelection();
      this.currentScreen = "teamSelection";
    },
    startTeamSelection() {
      this.viewModel.initializeMatch(this.player1Name, this.player2Name);
      this.viewModel.currentPlayer = this.viewModel.player1;
      this.currentPlayerSelectionMessage = `${this.player1Name}, selecciona el teu equip Pokémon`;
      this.currentPlayerSelectionDisplay = this.player1Name;
      this.renderGlobalList();
    },
    renderGlobalList() {
      this.globalPokemonList = this.viewModel.getGlobalList();
    },
    handleNextPlayer() {
      if (this.viewModel.currentPlayer === this.viewModel.player1) {
        this.viewModel.switchPlayer();
        if (this.isTwoPlayers) {
          this.currentPlayerSelectionMessage = `${this.player2Name}, selecciona el teu Pokémon`;
          this.currentPlayerSelectionDisplay = this.player2Name;
          this.buttonLabel = "Fi de la selecció d'equips";
        } else {
          this.currentPlayerSelectionMessage = `${this.player2Name} ha seleccionat el seu equip.`;
          this.viewModel.autoSelectCpuTeam();
          this.buttonLabel = "Fi de la selecció d'equips";
        }
      } else {
        this.transitionToBattle();
      }
    },
    handleSortOptions() {
      this.viewModel.sortGlobalList(this.sortCriteria, this.sortMethod);
      this.renderGlobalList();
    },
    isPokemonInTeam(name) {
      const playerTeam =
        this.viewModel.currentPlayer === this.viewModel.player1
          ? this.viewModel.player1.team
          : this.viewModel.player2.team;
      return playerTeam.selectedTeam.some((p) => p.name === name);
    },
    handleToggleSelection(pokemon) {
      const isInTeam = this.isPokemonInTeam(pokemon.name);
      if (isInTeam) {
        this.viewModel.removePokemonFromTeam(pokemon.name);
      } else {
        const addResult = this.viewModel.addPokemonToCurrentPlayer(pokemon);
        if (!addResult) {
          alert("No es pot afegir el Pokémon.");
        }
      }
    },
    transitionToBattle() {
      this.currentScreen = "battle";
      this.battleLog = [];
      this.currentTurn = this.viewModel.player1.getName();
      this.battleInProgress = true;
    },
    async performAttack() {
      const team1 = this.viewModel.player1.team;
      const team2 = this.viewModel.player2.team;
      const fighter1 = this.viewModel.getRandomFighter(team1);
      const fighter2 = this.viewModel.getRandomFighter(team2);

      this.currentPokemon1 = fighter1;
      this.currentPokemon2 = fighter2;

      if (!fighter1 || !fighter2) {
        const winner = fighter1
          ? this.viewModel.player1.getName()
          : this.viewModel.player2.getName();
        this.battleLog.push(`🏆 La batalla ha acabat! ${winner} és el guanyador!`);
        this.battleInProgress = false;
        return;
      }

      // Validación: usamos valores numéricos para special_power
      const sp1 = isNaN(fighter1.special_power) ? 0 : fighter1.special_power;
      const sp2 = isNaN(fighter2.special_power) ? 0 : fighter2.special_power;

      this.battleLog.push(`⚔️ ${fighter1.name} vs ${fighter2.name}`);
      await this.sleep(5000);

      if (sp1 === sp2) {
        this.battleLog.push(`💥 ${fighter1.name} i ${fighter2.name} es derroten mútuament!`);
        team1.removePokemon(fighter1.name);
        team2.removePokemon(fighter2.name);
      } else if (sp1 > sp2) {
        this.battleLog.push(`💥 ${fighter1.name} derrota ${fighter2.name}!`);
        const damageMade = team2.removePokemon(fighter2.name);
        const message = team1.decreaseSpecialPower(fighter1.name, damageMade);
        this.battleLog.push(message);
      } else {
        this.battleLog.push(`💥 ${fighter2.name} derrota ${fighter1.name}!`);
        const damageMade = team1.removePokemon(fighter1.name);
        const message = team2.decreaseSpecialPower(fighter2.name, damageMade);
        this.battleLog.push(message);
      }

      this.currentPokemon1 = null;
      this.currentPokemon2 = null;

      this.currentTurn =
        this.currentTurn === this.viewModel.player1.getName()
          ? this.viewModel.player2.getName()
          : this.viewModel.player1.getName();

      if (team1.selectedTeam.length === 0 || team2.selectedTeam.length === 0) {
        const winner = team1.selectedTeam.length > 0
          ? this.viewModel.player1.getName()
          : this.viewModel.player2.getName();
        this.battleLog.push(`🏆 La batalla ha acabat! ${winner} és el guanyador!`);
        this.battleInProgress = false;
      }
    },
    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    formatImageName(name) {
      return name.toLowerCase().replace(/\s+/g, "-") + ".png";
    },
  },
  computed: {
    creditsDisplay() {
      return this.viewModel.currentPlayer.team.credits;
    },
    currentPlayerTeam() {
      return this.viewModel.currentPlayer === this.viewModel.player1
        ? this.viewModel.player1.team.selectedTeam
        : this.viewModel.player2.team.selectedTeam;
    },
  },
  mounted() {
    fetch("./pokemon_data.json")
      .then((response) => response.json())
      .then((data) => {
        // Convertir atributos numéricos al cargar los datos
        data.forEach((poke) => {
          poke.points = Number(poke.points);
          poke.special_power = Number(poke.special_power);
        });
        this.viewModel.pokemonList.loadPokemons(data);
        this.renderGlobalList();
      })
      .catch((error) =>
        console.error("Error loading Pokémon data:", error)
      );
  },
};
</script>
