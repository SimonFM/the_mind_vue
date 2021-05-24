<template>
  <div v-if="isConnected && isGameStarted" class="game__hand">
    <div>
      <span class="text-h5">{{ 'Your hand' }}</span>
    </div>
    <div
      v-if="!playerHand || playerHand.length === 0"
      class="game__hand__empty"
    >
      <span>{{ 'You have an empty hand' }}</span>
    </div>
    <v-row v-else no-gutters class="mx-0 mb-0 pa-0 mt-3">
      <v-col v-for="card of playerHand" :key="card">
        <v-card outlined width="100px" height="150px">
          <v-card-title>{{ card }}</v-card-title>
          <v-card-actions>
            <v-spacer />
            <v-btn outlined rounded text @click="play(card)">
              {{ 'Play' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'PlayerHand',
  computed: {
    ...mapGetters(['isConnected', 'isGameStarted', 'playerHand'])
  },
  methods: {
    ...mapActions(['play'])
  }
}
</script>
