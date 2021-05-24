<template>
  <div v-if="hasCurrentGame" class="game__players">
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant.sync="mini"
      permanent
      app
    >
      <v-list-item class="px-2">
        <v-list-item-title>{{ `Lobby Code: ${gameCode}` }}</v-list-item-title>
        <v-btn icon @click.stop="mini = !mini">
          <v-icon>{{ 'mdi-chevron-left' }}</v-icon>
        </v-btn>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item v-if="!mini">
        <v-list-item-title>
          {{ 'Players in Lobby' }}
        </v-list-item-title>
      </v-list-item>
      <v-list dense class="game__players__list">
        <v-list-item v-for="player in players" :key="player.id" link>
          <v-list-item-icon>
            <v-icon
              :color="playerName === player.username ? 'primary' : 'secondary'"
              >{{ 'mdi-account' }}</v-icon
            >
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{
              playerName === player.username
                ? `${playerName} (You)`
                : player.username
            }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider />
      <v-list-item class="px-2">
        <v-list-item-title>{{ actionTitle }}</v-list-item-title>
        <v-btn
          v-if="!isGameStarted && players.length > 1"
          id="start-lobby"
          color="primary"
          :disabled="
            !isConnected ||
              !hasCurrentGame ||
              !players ||
              (canStartGame && isGameStarted)
          "
          @click="start"
        >
          {{ 'Start' }}
        </v-btn>
      </v-list-item>
    </v-navigation-drawer>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'GamePlayers',
  data() {
    return {
      drawer: false,
      mini: false
    }
  },
  computed: {
    ...mapGetters([
      'isConnected',
      'isGameStarted',
      'players',
      'hasPlayersInCurrentGame',
      'hasCurrentGame',
      'canStartGame',
      'playerName',
      'gameCode'
    ]),
    actionTitle() {
      if (!this.isGameStarted && this.players.length > 1) {
        return 'Ready!'
      }
      if (this.isGameStarted && this.players.length > 1) {
        return 'Game underway...'
      }
      return ''
    }
  },
  methods: {
    ...mapActions(['start'])
  }
}
</script>
