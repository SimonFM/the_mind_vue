<template>
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
</template>
<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'PlayerHand',
  computed: {
    ...mapGetters(['isConnected', 'isGameStarted', 'playerHand']),
  },
  methods: {
    ...mapActions(['play']),
  },
};
</script>
