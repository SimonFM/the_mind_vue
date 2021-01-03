<template>
  <v-container>
    <v-row class="mt-3">
      <span id="user">{{ `User: ${username}` }}</span>
    </v-row>
    <v-row class="my-3">
      <span id="room-name">{{ `Game: ${gameCode}` }}</span>
    </v-row>
    <v-row v-if="hasGame">
      <v-col cols="10">
        <v-item-group v-if="currentGame && currentGame.players">
          <v-subheader>Players</v-subheader>
          <v-item v-for="player of currentGame.players" :key="player.id">
            <v-chip> P: {{ player.username }} </v-chip>
          </v-item>
        </v-item-group>
      </v-col>
      <v-col cols="2">
        <v-btn
          id="start-lobby"
          color="primary"
          :disabled="
            !connected ||
            !currentGame ||
            !currentGame.players ||
            currentGame.players.length < 2
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
      <v-simple-table v-if="isDevMode && messages">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">ID</th>
              <th class="text-left">Message</th>
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
      currentUser: null,
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
      return (this.currentUser && this.currentUser.username) || 'None';
    },
    hasGame() {
      return !!(this.currentGame && this.currentGame.name);
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
    setupClient() {
      this.stompClient = WebSocket.getInstance();
      let thiz = this;

      this.stompClient.connect({}, () => {
        thiz.setConnected(true);
        thiz.stompClient.subscribe('/user/topic/game/connected', (message) => {
          if (!message || !message.body) {
            return;
          }
          thiz.currentUser = JSON.parse(message.body);
          thiz.addMessage(message);
        });
        thiz.stompClient.subscribe(
          '/user/topic/game/disconnected',
          (message) => {
            thiz.currentUser = null;
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
    sendMessage(url, payload = {}) {
      this.stompClient.send(url, JSON.stringify(payload));
    },
    addMessage(message) {
      this.messages = [message, ...this.messages];
    },
  },
};
</script>
<style lang="scss">
</style>
