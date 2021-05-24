import Vue from 'vue'
import Vuex from 'vuex'
import engine from './engine'
import messages from './messages'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    engine,
    messages
  }
})
