<template>
  <div v-if="isConnected && isGameStarted" class="game__table">
    <div>
      <span class="text-h5">{{ 'Played Cards' }}</span>
    </div>
    <div
      v-if="!hasPlayedCards || playedCards.length < 1"
      class="game__hand__empty"
    >
      {{ 'No cards played' }}
    </div>
    <v-row v-else no-gutters class="mx-0 mb-0 pa-0 mt-3">
      <v-col v-for="card of playedCards" :key="card">
        <v-card outlined width="100px" height="150px">
          <v-card-title>{{ card }}</v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  name: 'GameTable',
  computed: {
    ...mapGetters([
      'isConnected',
      'isGameStarted',
      'hasPlayedCards',
      'playedCards'
    ])
  }
}
</script>
