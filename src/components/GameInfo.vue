<template>
  <div class="game__info">
    <v-row class="mt-3">
      <v-col v-if="currentGame && currentGame.currentLevel > -1">
        <span id="current-level" class="text-h6">{{
          `Level ${currentGame.currentLevel}`
        }}</span>
      </v-col>
    </v-row>
    <div v-if="isConnected && isGameStarted">
      <v-row class="mt-3">
        <span id="lives">{{ `Lives: ${lives}` }}</span>
      </v-row>
      <v-row class="mt-3">
        <span id="ninja-stars">{{ `Ninja stars: ${ninjaStars}` }}</span>
      </v-row>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'GameInfo',
  computed: {
    ...mapGetters([
      'isConnected',
      'isGameStarted',
      'currentGame',
      'lives',
      'ninjaStars',
      'gameCode'
    ])
  }
}
</script>
