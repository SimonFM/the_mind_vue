<template>
  <v-app>
    <v-app-bar app color="primary" dark dense>
      <v-toolbar-title>The Mind</v-toolbar-title>
      <v-spacer />
    </v-app-bar>
    <v-main>
      <message-table />
    </v-main>
  </v-app>
</template>

<script>
import MessageTable from './components/MessageTable.vue';

export default {
  name: 'App',
  components: {
    MessageTable,
  },
};
</script>
