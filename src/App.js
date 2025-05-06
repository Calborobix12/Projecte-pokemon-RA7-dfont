import { PokemonUI } from "../view.js";
import PokemonCard from "./PokemonCard.js";

export const App = {
  components: {
    "pokemon-card": PokemonCard,
  },
  template: /*html*/ `
  <div>
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
        <!-- Secció de selecció de l'equip -->
  <section v-if="currentScreen === 'teamSelection'" id="team-selection-section">
      <h2>Selecciona el teu Equip</h2>
      <h2>{{ currentPlayerSelectionMessage }}</h2>        
      <h2 id="credits-display">
          Crèdits restants: <span id="credits-value">{{ creditsDisplay }}</span>
      </h2>
      <div id="team-section">
          <h2 id="current-player-selection">{{ currentPlayerSelectionDisplay }}</h2>
          <div id="selected-team-grid" class="grid-container" ref="teamContainer">
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
          {{buttonLabel}}
      </button>
      <!-- Opcions d'ordenació -->
      <div id="sort-options-section">
          <h2>Opcions d'Ordenació</h2>
          <form id="sort-options-form">
              <fieldset>
                  <legend>Ordena per:</legend>
                  <label>
                  <input type="radio" name="sort-criteria" value="name" v-model="sortCriteria" />
                  Nom
                  </label>
                  <label>
                  <input type="radio" name="sort-criteria" value="points" v-model="sortCriteria" />
                  Punts
                  </label>
                  <label>
                  <input type="radio" name="sort-criteria" value="type" v-model="sortCriteria" />
                  Tipus
                  </label>
              </fieldset>
              <fieldset>
                  <legend>Mètode d'ordenació:</legend>
                  <label>
                  <input type="radio" name="sort-method" value="bubble" v-model="sortMethod" />
                  Bombolla
                  </label>
                  <label>
                  <input type="radio" name="sort-method" value="insertion" v-model="sortMethod" />
                  Inserció
                  </label>
                  <label>
                  <input type="radio" name="sort-method" value="selection" v-model="sortMethod" />
                  Selecció
                  </label>
              </fieldset>
              <button type="button" id="sort-team" @click="handleSortOptions">
              Ordenar
              </button>
          </form>
      </div>
      <div id="pokemon-grid" class="grid-container" ref="gridContainer">
          <pokemon-card
          v-for="(poke, index) in globalPokemonList"
          :key="index"
          :pokemon="poke"
          :is-selected="isPokemonInTeam(poke.name)"
          @toggle-selection="handleToggleSelection"
          />
      </div>
  </section>
</div>    
`,
  data() {
    return {
      currentScreen: "setup",
      isTwoPlayers: true,
      player1Name: "",
      player2Name: "",
      currentPlayerSelectionMessage: "",
      currentPlayerSelectionDisplay: "",
      //      creditsDisplay: "",
      sortCriteria: "",
      sortMethod: "",
      globalPokemonList: [],
      //      currentPlayerTeam: [],
      showTeamList: [],
      buttonLabel: "Següent Jugador",
      view: new PokemonUI(),
    };
  },
  methods: {
    startGame() {
      this.view.init();
      //      this.view.bindEvents();
      if (!this.player1Name || (this.isTwoPlayers && !this.player2Name)) {
        alert("Si us plau, introdueix els noms de tots els jugadors.");
        return;
      }
      if (!this.isTwoPlayers) {
        this.player2Name = "CPU";
      }
      console.log(
        `Jugador 1: ${this.player1Name}, Jugador 2: ${this.player2Name}`
      );
      this.currentScreen = "teamSelection";
      this.creditsDisplay = this.view.viewModel.currentPlayer.team.credits;
      this.startTeamSelection();
    },
    startTeamSelection() {
      // Call initializeMatch() on the ViewModel to set up players
      this.view.viewModel.initializeMatch(this.player1Name, this.player2Name);
      // Set up for Player 1's team selection
      this.view.viewModel.currentPlayer = this.view.viewModel.player1;
      this.currentPlayerSelectionMessage = `${this.player1Name}, selecciona el teu equip Pokémon`;
      this.renderGlobalList();
      //      this.updateCreditsDisplay();
    },
    // Exemple del mètode adaptat
    renderGlobalList() {
      // En lloc de manipular el DOM, actualitzem la propietat reactiva:
      this.globalPokemonList = this.view.viewModel.getGlobalList();
      // Això farà que Vue re-renderitzi la graella amb la nova llista.
    },
    renderSelectionTeam() {
      this.currentPlayerTeam = this.view.viewModel.currentPlayer.getTeam();
    },
    handleNextPlayer() {
      // Check the current player and handle transitions.
      if (this.view.viewModel.currentPlayer === this.view.viewModel.player1) {
        // Player 1 finished selecting their team.
        this.view.viewModel.switchPlayer();
        if (this.isTwoPlayers) {
          //
          // Two-player mode: move to Player 2.
          //this.view.viewModel.currentPlayer = this.player2Name;
          //          this.view.viewModel.switchPlayer();
          //const player2Name = this.view.viewModel.currentPlayer.getName(); // Fetch Player 2 name
          this.currentPlayerSelectionMessage = `${this.player2Name}, selecciona el teu Pokémon`;
          //          this.updateCurrentPlayerTeam();
          // Re-render for Player 2's team selection.
          //          this.renderGlobalList();
          //          this.updateCreditsDisplay();
          this.buttonLabel = "Fi de la selecció d'equips";
        } else {
          // One player vs. CPU: automatically select a team for the CPU.
          this.currentPlayerSelectionMessage = `${this.player2Name} ha seleccionat el seu equip.`;
          this.view.viewModel.autoSelectCpuTeam();
          //          this.updateCurrentPlayerTeam();
          this.buttonLabel = "Fi de la selecció d'equips";
          //          this.view.transitionToBattle();
        }
      } else if (this.currentPlayer === 2) {
        // Both players have selected their teams.
        this.view.transitionToBattle();
      }
    },
    updateCurrentPlayerTeam() {
      // En lloc de manipular el DOM, actualitzem la propietat reactiva:
      this.currentPlayerTeam = this.view.viewModel.getCurrentTeam();
      // Això farà que Vue re-renderitzi la graella amb la nova llista.
    },
    handleSortOptions() {
      this.view.viewModel.sortGlobalList(this.sortCriteria, this.sortMethod);
      this.renderGlobalList();
    },
    updateCreditsDisplay() {
      this.creditsDisplay = `${this.view.viewModel
        .getCurrentPlayer()
        .getCredits()}`;
    },
    isPokemonInTeam(name) {
      const playerTeam =
        this.view.viewModel.currentPlayer === this.view.viewModel.player1
          ? this.view.viewModel.player1.team
          : this.view.viewModel.player2.team;
      return playerTeam.selectedTeam.some((p) => p.name === name);
    },
    // Called from inside the parent when child emits `toggle-selection`
    handleToggleSelection(pokemon) {
      // If it's already in the team, remove it. Otherwise, try to add it.
      const isInTeam = this.isPokemonInTeam(pokemon.name);
      if (isInTeam) {
        this.view.viewModel.removePokemonFromTeam(pokemon.name);
      } else {
        const addResult =
          this.view.viewModel.addPokemonToCurrentPlayer(pokemon);
        if (!addResult) {
          alert("No es pot afegir el Pokémon.");
        }
      }

      // After adding/removing, refresh the player's team
      //      this.updateCurrentPlayerTeam();
      // Possibly update credits or other UI
      //      this.updateCreditsDisplay();
    },
  },
  // Altres mètodes...
  mounted() {
    this.view.fetchAndLoadPokemons();
    // Aquí pots comprovar la referència del grid si cal
    console.log("Grid container:", this.$refs.gridContainer);
  },
  // ...
  computed: {
    creditsDisplay() {
      // Return the current player’s credits directly from the viewModel
      return this.view.viewModel.currentPlayer.team.credits;
    },
    currentPlayerTeam() {
      return this.view.viewModel.getCurrentTeam();
    },
  },
};
