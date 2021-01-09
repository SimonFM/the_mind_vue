<template>
  <div v-if="isConnected && isGameStarted">
    <v-row>
      <span class="text-h5">{{ "Played Cards" }}</span>
    </v-row>
    <v-row class="mt-3">
      <v-col />
      <v-col>
        <v-card outlined width="100px" height="150px">
          <v-card-title
            >{{
              hasPlayedCards ? playedCards[playedCards.length - 1] : "EMPTY"
            }}
          </v-card-title>
        </v-card>
      </v-col>
      <v-col />
    </v-row>
  </div>
</template>
<script>
import { mapGetters } from "vuex";

export default {
  name: "GameTable",
  computed: {
    ...mapGetters([
      "isConnected",
      "isGameStarted",
      "hasPlayedCards",
      "playedCards"
    ])
  }
};
</script>
