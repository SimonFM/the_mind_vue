<template>
  <div>
    <v-row class="mt-3">
      <v-col>
        <span id="user" class="text-h6">{{ `User: ${playerName}` }}</span>
      </v-col>
      <v-col>
        <span id="room-name" class="text-h6">{{ `Game: ${gameCode}` }}</span>
      </v-col>
      <v-col v-if="currentGame && currentGame.currentLevel > -1">
        <span id="current-level" class="text-h6">{{
          `Level ${currentGame.currentLevel}`
        }}</span>
      </v-col>
    </v-row>
    <div v-if="isConnected && isGameStarted">
      <v-row class="mt-3">
        <v-col>
          <span id="lives">{{ `Lives: ${lives}` }}</span>
        </v-col>
        <v-col>
          <span id="ninja-stars">{{ `Ninja stars: ${ninjaStars}` }}</span>
        </v-col>
      </v-row>
      <v-row>
        <span class="text-h5">{{ 'Played Cards' }}</span>
      </v-row>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
export default {
  name: 'GameInfo',
  computed: {
    ...mapGetters([
      'isConnected',
      'isGameStarted',
      'currentGame',
      'lives',
      'ninjaStars',
      'playerName',
      'gameCode',
    ]),
  },
};
</script>
