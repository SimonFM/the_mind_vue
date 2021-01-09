<template>
  <v-container>
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
      <v-row class="mt-3">
        <v-col />
        <v-col>
          <v-card outlined width="100px" height="150px">
            <v-card-title
              >{{
                hasPlayedCards ? playedCards[playedCards.length - 1] : 'EMPTY'
              }}
            </v-card-title>
          </v-card>
        </v-col>
        <v-col />
      </v-row>
    </div>
    <v-row v-if="isConnected && isGameStarted">
      <v-row v-if="!playerHand">
        <span class="text-h5">{{ 'You have an empty hand' }}</span>
      </v-row>
      <v-row v-else class="mt-3">
        <v-row class="text-h6 ml-3">{{ 'Your hand' }}</v-row>
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
    </v-row>
    <v-row v-if="hasCurrentGame">
      <v-col cols="10">
        <v-item-group v-if="hasPlayersInCurrentGame">
          <v-subheader>{{ 'Players' }}</v-subheader>
          <v-item v-for="player of players" :key="player.id">
            <v-chip class="ml-2"> Player {{ playerName }} </v-chip>
          </v-item>
        </v-item-group>
      </v-col>
      <v-col cols="2" v-if="!isGameStarted && players.length > 1">
        <v-btn
          id="start-lobby"
          color="primary"
          :disabled="
            !isConnected ||
            !hasCurrentGame ||
            !currentGame.players ||
            (canStartGame && isGameStarted)
          "
          @click="start"
        >
          {{ 'Start' }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-if="!hasCurrentGame">
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
          :disabled="!isConnected"
          @click="join(joinGameCode)"
        >
          {{ 'Join Lobby' }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-if="!hasCurrentGame">
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
    <span class="text-h6"> Messages </span>
    <v-row class="mt-2">
      <v-simple-table v-if="isDevMode && messages" class="messages">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">ID</th>
              <th class="text-left">Message</th>
              <th class="text-left">RAW</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="message of messages"
              :key="message.headers['message-id']"
            >
              <td>
                <span>{{ message.headers['message-id'] }}</span>
              </td>
              <td>
                <span>{{ getMessage(message) }}</span>
              </td>
              <td>
                <span>{{ JSON.stringify(message) }}</span>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-row>
    <v-snackbar
      v-if="isGameStarted"
      :value="isGameStarted"
      :timeout="5 * 1000"
      top
      right
    >
      {{ 'Game has started' }}
    </v-snackbar>
    <v-snackbar
      v-if="didGameLevelUp"
      :value="didGameLevelUp"
      :timeout="5 * 1000"
      top
      right
    >
      {{ `Level ${currentGame.currentLevel}` }}
    </v-snackbar>
    <v-snackbar
      v-if="isGameOver"
      :value="isGameOver"
      :timeout="5 * 1000"
      top
      right
    >
      {{ 'GAME OVER' }}
    </v-snackbar>
  </v-container>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'MessageTable',
  data() {
    return {
      createGameCode: '',
      joinGameCode: '',
    };
  },
  created() {
    this.initGameLobbyConnections();
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
      'canStartGame',
    ]),
    isDevMode() {
      return process.env.NODE_ENV !== 'production';
    },
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
      'clearCurrentGame',
    ]),
    getMessage(message) {
      let val = 'Unable to find message';
      if (message && message.body) {
        const obj = JSON.parse(message.body);
        val = (obj && obj.message) || 'Unable to find message';
      }
      return val;
    },
  },
};
</script>
<style lang="scss">
// TODO: Make style sheets.
.messages {
  overflow-y: scroll;
  height: 50%;
}
</style>
