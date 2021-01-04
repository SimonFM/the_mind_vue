<template>
  <v-container>
    <v-row class="mt-3">
      <v-col>
        <span id="user">{{ `User: ${username}` }}</span>
      </v-col>
      <v-col>
        <span id="room-name">{{ `Game: ${gameCode}` }}</span>
      </v-col>
    </v-row>
    <v-row v-if="connected && currentGame && currentGame.started" class="mt-3">
      <v-col>
        <span id="lives">{{ `Lives: ${lives}` }}</span>
      </v-col>
      <v-col>
        <span id="ninja-stars">{{ `Ninja stars: ${ninjaStars}` }}</span>
      </v-col>
    </v-row>
    <v-row v-if="connected && currentGame && currentGame.started">
      <div v-if="!currentPlayer.hand">
        <span>{{ 'You have an empty hand' }}</span>
      </div>
      <v-col v-else v-for="card of currentPlayer.hand" :key="card">
        <v-card outlined max-width="10%">
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
    <v-row v-if="hasGame">
      <v-col cols="10">
        <v-item-group v-if="currentGame && currentGame.players">
          <v-subheader>Players</v-subheader>
          <v-item v-for="player of currentGame.players" :key="player.id">
            <v-chip class="ml-2"> Player {{ player.username }} </v-chip>
          </v-item>
        </v-item-group>
      </v-col>
      <v-col cols="2" v-if="!currentGame.started">
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
    <span class="headline"> Messages </span>
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
      v-if="currentGame && currentGame.started"
      :value="currentGame && currentGame.started"
      :timeout="5 * 1000"
      top
      right
    >
      {{ 'Game has started' }}
    </v-snackbar>
    <v-snackbar
      v-if="currentGame && currentGame.gameOver"
      :value="currentGame && currentGame.gameOver"
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
      thiz.addMessage(message);
      if (!message || !message.body) {
        return;
      }
      thiz.currentGame = JSON.parse(message.body);
      this.stompClient.subscribe(this.currentLobbyDestination, (message) => {
        const body = JSON.parse(message.body);
        const previousGame = thiz.currentGame;
        thiz.currentGame = body.data; //TODO: Maybe make more specific actions...
        if (thiz.currentGame && thiz.currentGame.players) {
          const currentPlayer = thiz.currentGame.players.find(
            (p) => p && p.id === thiz.currentPlayer.id
          );
          if (currentPlayer) {
            thiz.currentPlayer = currentPlayer;
          }
        }
        if (
          previousGame &&
          previousGame.isNotStarted &&
          thiz.currentGame.isStarted
        ) {
          console.log('Game is started.... :D');
        }
        thiz.addMessage(message);
      });
    },
    getMessage(message) {
      let val = 'Unable to find message';
      if (message && message.body) {
        const obj = JSON.parse(message.body);
        val = obj ? obj.message : 'Unable to find message';
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
.messages {
  overflow-y: scroll;
  height: 50%;
}
</style>
