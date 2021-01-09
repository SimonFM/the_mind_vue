<template>
  <v-container>
    <v-row class="mt-3">
      <v-col>
        <span id="user" class="text-h6">{{ `User: ${username}` }}</span>
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
    <div v-if="connected && currentGame && currentGame.started">
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
                currentGame.playedCards && currentGame.playedCards.length > 0
                  ? currentGame.playedCards[currentGame.playedCards.length - 1]
                  : 'EMPTY'
              }}
            </v-card-title>
          </v-card>
        </v-col>
        <v-col />
      </v-row>
    </div>
    <v-row v-if="connected && currentGame && currentGame.started">
      <v-row v-if="!hand">
        <span class="text-h5">{{ 'You have an empty hand' }}</span>
      </v-row>
      <v-row v-else class="mt-3">
        <v-row class="text-h6 ml-3">{{ 'Your hand' }}</v-row>
        <v-col v-for="card of hand" :key="card">
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
    <v-row v-if="hasGame">
      <v-col cols="10">
        <v-item-group v-if="currentGame && currentGame.players">
          <v-subheader>{{ 'Players' }}</v-subheader>
          <v-item v-for="player of currentGame.players" :key="player.id">
            <v-chip class="ml-2"> Player {{ player.username }} </v-chip>
          </v-item>
        </v-item-group>
      </v-col>
      <v-col
        cols="2"
        v-if="!currentGame.started && currentGame.players.length > 1"
      >
        <v-btn
          id="start-lobby"
          color="primary"
          :disabled="
            !connected ||
            !currentGame ||
            !currentGame.players ||
            (currentGame.players.length < 2 && currentGame.started)
          "
          @click="startGame"
        >
          {{ 'Start' }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-if="!hasGame">
      <v-col cols="10">
        <v-form id="join-game-form">
          <v-text-field
            id="join-code"
            v-model="joinGameCode"
            label="Join Code"
            placeholder="Your code here..."
            outlined
            dense
            :disabled="!connected"
          />
        </v-form>
      </v-col>
      <v-col cols="2">
        <v-btn
          id="join-room"
          color="primary"
          :disabled="!connected"
          @click="joinRoom"
        >
          {{ 'Join Lobby' }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-if="!hasGame">
      <v-col cols="10">
        <v-form id="create-game-form">
          <v-text-field
            id="room-key"
            v-model="createGameCode"
            label="Create Room"
            placeholder="Optional name..."
            outlined
            dense
            :disabled="!connected"
          />
        </v-form>
      </v-col>
      <v-col cols="2">
        <v-btn
          id="create-room"
          color="primary"
          :disabled="!connected"
          @click="createRoom"
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
      v-if="isStarted"
      :value="isStarted"
      :timeout="5 * 1000"
      top
      right
    >
      {{ 'Game has started' }}
    </v-snackbar>
    <v-snackbar
      v-if="didLevelUp"
      :value="didLevelUp"
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
import WebSocket from '@/api/websocket';

export default {
  name: 'MessageTable',
  data() {
    return {
      stompClient: null,
      createGameCode: '',
      joinGameCode: '',
      currentPlayer: null,
      currentGame: null,
      messages: [],
      connected: false,
    };
  },
  created() {
    this.setupClient();
  },
  computed: {
    username() {
      return (this.currentPlayer && this.currentPlayer.username) || 'None';
    },
    hasGame() {
      return !!(this.currentGame && this.currentGame.name);
    },
    lives() {
      return (this.currentGame && this.currentGame.lives) || -1;
    },
    ninjaStars() {
      return (this.currentGame && this.currentGame.ninjaStars) || -1;
    },
    gameCode() {
      return (this.currentGame && this.currentGame.name) || 'None';
    },
    currentLobbyDestination() {
      return `/user/topic/game/${this.currentGame.id}`;
    },
    isDevMode() {
      return process.env.NODE_ENV !== 'production';
    },
    didLevelUp() {
      return this.currentGame && this.currentGame.levelUp;
    },
    isStarted() {
      return this.currentGame && this.currentGame.started;
    },
    isGameOver() {
      return this.currentGame && this.currentGame.gameOver;
    },
    hand() {
      return (this.currentPlayer && this.currentPlayer.hand) || [];
    },
  },
  //TODO: Move all this in to a vuex component.... Breaks it up a little bit.
  methods: {
    setConnected(connected) {
      this.connected = connected;
    },
    disconnect() {
      this.setConnected(false);
      this.sendMessage('/app/game/disconnect');
      if (this.stompClient !== null) {
        this.stompClient.disconnect();
      }
    },
    joinRoom() {
      this.sendMessage('/app/game/join', {
        invite: this.joinGameCode,
      });
    },
    createRoom() {
      this.sendMessage('/app/game/create', { name: this.createGameCode });
    },
    getRoom() {
      this.sendMessage('/app/game/get', { invite: this.joinGameCode });
    },
    startGame() {
      this.sendMessage('/app/game/start', { roomId: this.currentGame.name });
    },
    play(card) {
      this.sendMessage('/app/game/card', {
        roomName: this.currentGame.name,
        data: card,
      });
    },
    setupClient() {
      this.stompClient = WebSocket.getInstance();
      let thiz = this;

      this.stompClient.connect({}, () => {
        thiz.setConnected(true);
        thiz.stompClient.subscribe('/user/topic/game/connected', (message) => {
          if (!message || !message.body) {
            return;
          }
          thiz.currentPlayer = JSON.parse(message.body);
          thiz.addMessage(message);
        });
        thiz.stompClient.subscribe(
          '/user/topic/game/disconnected',
          (message) => {
            thiz.currentPlayer = null;
            thiz.addMessage(message);
          }
        );
        thiz.stompClient.subscribe(
          '/user/topic/game/join',
          this.subscribeToLobby
        );
        thiz.stompClient.subscribe(
          '/user/topic/game/create',
          this.subscribeToLobby
        );
        thiz.stompClient.subscribe('/user/topic/game/messages', (message) => {
          if (!message || !message.body) {
            return;
          }
          thiz.addMessage(message);
        });
        thiz.sendMessage('/app/game/connect');
      });
    },
    subscribeToLobby(message) {
      const thiz = this;
      this.addMessage(message);
      if (!message || !message.body) {
        return;
      }
      this.currentGame = JSON.parse(message.body);
      this.stompClient.subscribe(this.currentLobbyDestination, (message) => {
        thiz.addMessage(message);
        const body = JSON.parse(message.body);
        thiz.currentGame = body.data; //TODO: Maybe make more specific actions...
        if (!thiz.currentGame) {
          return;
        }
        const currentPlayer = thiz.currentGame.players.find(
          (p) => p && p.id === thiz.currentPlayer.id
        );
        if (currentPlayer) {
          thiz.currentPlayer = currentPlayer;
        }
      });
    },
    getMessage(message) {
      let val = 'Unable to find message';
      if (message && message.body) {
        const obj = JSON.parse(message.body);
        val = (obj && obj.message) || 'Unable to find message';
      }
      return val;
    },
    sendMessage(url, payload = {}) {
      this.stompClient.send(url, JSON.stringify(payload));
    },
    addMessage(message) {
      if (!message) {
        return;
      }
      this.messages = [message, ...this.messages];
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
