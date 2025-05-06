<template>
  <div 
    class="pokemon-card" 
    :class="{ selected: isSelected }" 
    @click="onToggleSelection"
  >
    <img :src="pokemon.image" :alt="pokemon.name" class="pokemon-image" />
    <h3>{{ pokemon.name }}</h3>
    <p v-if="pokemon.types && pokemon.types.length">
      Tipus: {{ pokemon.types.join(', ') }}
    </p>
    <p>Punts: {{ pokemon.points }}</p>
    <p v-if="pokemon.special_power">Especial: {{ pokemon.special_power }}</p>
  </div>
</template>

<script>
export default {
  name: 'PokemonCard',
  props: {
    // The Pokémon data
    pokemon: {
      type: Object,
      required: true
    },
    // Whether this Pokémon is in the team or not (used to set 'selected' class)
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onToggleSelection() {
      // Emitir el evento para que el componente padre lo gestione
      this.$emit('toggle-selection', this.pokemon);
    }
  }
};
</script>