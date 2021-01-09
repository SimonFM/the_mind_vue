<template>
  <div>
    <span class="text-h6"> {{ 'Messages' }} </span>
    <v-row class="mt-2">
      <v-simple-table v-if="isDevMode && messages" class="messages">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">{{ 'ID' }}</th>
              <th class="text-left">{{ 'Message' }}</th>
              <th class="text-left">{{ 'RAW' }}</th>
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
  </div>
</template>
<script>
import { mapGetters } from 'vuex';

export default {
  name: 'MessageTable',
  computed: {
    ...mapGetters(['messages']),
    isDevMode() {
      return process.env.NODE_ENV !== 'production';
    },
  },
  methods: {
    getMessage(message) {
      let val = 'Unable to find message';
      if (message && message.body) {
        const obj = JSON.parse(message.body);
        val = (obj && obj.message) || 'Unable to find message';
      }
      return val;
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
