<template>
  <v-row v-if="hasCurrentGame">
    <v-col cols="10">
      <v-item-group v-if="hasPlayersInCurrentGame">
        <v-subheader>{{ 'Players' }}</v-subheader>
        <v-item v-for="player of players" :key="player.id">
          <v-chip class="ml-2"> Player {{ player.username }} </v-chip>
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
          !players ||
          (canStartGame && isGameStarted)
        "
        @click="start"
      >
        {{ 'Start' }}
      </v-btn>
    </v-col>
  </v-row>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'GamePlayers',
  computed: {
    ...mapGetters([
      'isConnected',
      'isGameStarted',
      'players',
      'hasPlayersInCurrentGame',
      'hasCurrentGame',
      'canStartGame',
    ]),
  },
  methods: {
    ...mapActions(['start']),
  },
};
</script>
