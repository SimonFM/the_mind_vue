<template>
  <v-app>
    <v-app-bar app color="primary" dark dense>
      <v-toolbar-title>The Mind</v-toolbar-title>
      <v-spacer />
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
};
</script>
