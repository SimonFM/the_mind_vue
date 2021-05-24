<template>
  <div v-if="!hasCurrentGame" class="game__controls">
    <v-row>
      <v-col cols="10">
        <v-form id="join-game-form">
          <v-text-field
            id="join-code"
            v-model="joinGameCode"
            label="Join Code"
            placeholder="Your code here..."
            outlined
            dense
            :disabled="!isConnected"
          />
        </v-form>
      </v-col>
      <v-col cols="2">
        <v-btn
          id="join-room"
          color="primary"
          :disabled="!isConnected || !joinGameCode"
          @click="join(joinGameCode)"
        >
          {{ 'Join Lobby' }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="10">
        <v-form id="create-game-form">
          <v-text-field
            id="room-key"
            v-model="createGameCode"
            label="Create Room"
            placeholder="Optional name..."
            outlined
            dense
            :disabled="!isConnected"
          />
        </v-form>
      </v-col>
      <v-col cols="2">
        <v-btn
          id="create-room"
          color="primary"
          :disabled="!isConnected"
          @click="create(createGameCode)"
        >
          {{ 'Create Lobby' }}
        </v-btn>
      </v-col>
    </v-row>
  </div>
  <div v-else class="game__controls"></div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'GameControls',
  data() {
    return {
      createGameCode: '',
      joinGameCode: ''
    }
  },
  computed: {
    ...mapGetters([
      'messages',
      'isConnected',
      'hasCurrentPlayer',
      'currentPlayer',
      'hasCurrentGame',
      'currentGame',
      'gameCode',
      'isGameOver',
      'isGameStarted',
      'didGameLevelUp',
      'lives',
      'ninjaStars',
      'playerName',
      'playerHand',
      'playedCards',
      'hasPlayedCards',
      'hasPlayersInCurrentGame',
      'players',
      'canStartGame'
    ])
  },
  methods: {
    ...mapActions([
      'initGameLobbyConnections',
      'disconnect',
      'join',
      'create',
      'start',
      'play',
      'clearCurrentPlayer',
      'clearCurrentGame'
    ])
  }
}
</script>
