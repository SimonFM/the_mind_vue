<template>
  <v-container class="game">
    <game-players />
    <game-info />
    <game-controls />
    <game-table />
    <player-hand />
    <message-table />
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
    <div id="notifications">
      <v-snackbar
        v-for="notfication of notifications"
        :key="notfication.id"
        :value="notfication.activate()"
        :timeout="5 * 1000"
        top
        right
      >
        {{ notfication.getMessage() }}
      </v-snackbar>
    </div>
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
import { mapActions, mapGetters } from 'vuex'
import GameControls from '../components/GameControls.vue'

import GameInfo from '../components/GameInfo.vue'
import GamePlayers from '../components/GamePlayers.vue'
import GameTable from '../components/GameTable.vue'
import PlayerHand from '../components/PlayerHand.vue'
import MessageTable from '../components/MessageTable.vue'

export default {
  name: 'Home',
  components: {
    GameInfo,
    GameTable,
    PlayerHand,
    GamePlayers,
    GameControls,
    MessageTable
  },
  data() {
    return {
      notifications: [
        {
          id: 'game-over',
          getMessage: () => {
            return 'GAME OVER'
          },
          activate: () => {
            return this.isGameOver
          }
        },
        {
          id: 'game-is-started',
          getMessage: () => {
            return 'Game has started'
          },
          activate: () => {
            return this.isGameStarted
          }
        },
        {
          id: 'level-up',
          getMessage: () => {
            return `Level ${(this.hasCurrentGame &&
              this.currentGame.currentLevel) ||
              -1}`
          },
          activate: () => {
            return this.didGameLevelUp
          }
        }
      ]
    }
  },
  created() {
    this.initGameLobbyConnections()
  },
  computed: {
    ...mapGetters([
      'isGameOver',
      'isGameStarted',
      'didGameLevelUp',
      'currentGame',
      'hasCurrentGame'
    ])
  },
  methods: {
    ...mapActions(['initGameLobbyConnections'])
  }
}
</script>
