
const createDefaultState = () => {
  return {
    messages: []
  };
};

const state = createDefaultState();

const getters = {
  messages: state => state.messages,
};

const actions = {
  addMessage({ commit }, message) {
    commit('addMessage', message);
  }
};

const mutations = {
  addMessage(state, message) {
    state.messages = [message, ...state.messages];
  }
};

export default {
  state,
  getters,
  actions,
  mutations
}