import WebSocket from '@/api/websocket'

const createDefaultState = () => {
  return {
    stompClient: WebSocket.getInstance(),
    createGameCode: '',
    joinGameCode: '',
    currentPlayer: null,
    currentGame: null,
    messages: [],
    connected: false
  }
}

const state = createDefaultState()

const getters = {
  lobbyClient: state => state.stompClient,
  isConnected: state => state.connected,
  hasCurrentPlayer: state => state.currentPlayer,
  currentPlayer: state => state.currentPlayer,
  hasCurrentGame: state => !!state.currentGame,
  players: state => (state.currentGame && state.currentGame.players) || [],
  hasPlayersInCurrentGame: state =>
    state.currentGame &&
    state.currentGame.players &&
    state.currentGame.players.length > 0,
  canStartGame: state =>
    state.currentGame &&
    state.currentGame.players &&
    state.currentGame.players.length > 1,
  currentGame: state => state.currentGame,
  playedCards: state =>
    (state.currentGame && state.currentGame.playedCards) || [],
  hasPlayedCards: state =>
    state.currentGame &&
    state.currentGame.playedCards &&
    state.currentGame.playedCards.length > 0,
  currentGameUrl: state => {
    if (!state.currentGame) {
      return ''
    }
    return `/user/topic/game/${state.currentGame.id}`
  },
  gameCode: state => (state.currentGame && state.currentGame.name) || 'None',
  isGameOver: state => state.currentGame && state.currentGame.gameOver,
  isGameStarted: state => state.currentGame && state.currentGame.started,
  didGameLevelUp: state => state.currentGame && state.currentGame.levelUp,
  lives: state => (state.currentGame && state.currentGame.lives) || -1,
  ninjaStars: state =>
    (state.currentGame && state.currentGame.ninjaStars) || -1,

  playerName: state =>
    (state.currentPlayer && state.currentPlayer.username) || 'None',
  playerHand: state => (state.currentPlayer && state.currentPlayer.hand) || []
}

const actions = {
  initGameLobbyConnections({ getters, commit, dispatch }) {
    const client = getters.lobbyClient

    client.connect({}, () => {
      commit('setConnected', true)
      dispatch('setupConnectedChannel')
      dispatch('setupDisconnectedChannel')
      dispatch('setupJoinChannel')
      dispatch('setupCreateChannel')
      dispatch('setupMessagesChannel')
      dispatch('connect')
    })
  },
  connect({ dispatch }) {
    dispatch('sendMessage', { url: '/app/game/connect', payload: null })
  },
  setupConnectedChannel({ getters, commit, dispatch }) {
    const client = getters.lobbyClient
    client.subscribe('/user/topic/game/connected', message => {
      if (!message || !message.body) {
        return
      }
      commit('setCurrentPlayer', JSON.parse(message.body))
      dispatch('addMessage', message)
    })
  },
  disconnect({ getters, dispatch }) {
    const client = getters.lobbyClient
    dispatch('sendMessage', { url: '/app/game/disconnect', payload: {} })
    if (client) {
      client.disconnect()
    }
  },
  setupDisconnectedChannel({ getters, dispatch }) {
    const client = getters.lobbyClient
    client.subscribe('/user/topic/game/disconnected', message => {
      dispatch('clearCurrentPlayer')
      dispatch('addMessage', message)
    })
  },
  join({ dispatch }, code) {
    dispatch('sendMessage', {
      url: '/app/game/join',
      payload: { invite: code }
    })
  },
  setupJoinChannel({ getters, dispatch }) {
    const client = getters.lobbyClient
    client.subscribe('/user/topic/game/join', async message => {
      await dispatch('subscriptionToLobby', message)
      client.subscribe(getters.currentGameUrl, message => {
        if (!message || !message.body) {
          return
        }
        dispatch('subscriptionToLobby', message)
      })
    })
  },
  create({ dispatch }, name) {
    dispatch('sendMessage', { url: '/app/game/create', payload: { name } })
  },
  setupCreateChannel({ getters, dispatch }) {
    const client = getters.lobbyClient
    client.subscribe('/user/topic/game/create', async message => {
      await dispatch('subscriptionToLobby', message)
      client.subscribe(getters.currentGameUrl, message => {
        if (!message || !message.body) {
          return
        }
        dispatch('subscriptionToLobby', message)
      })
    })
  },
  start({ getters, dispatch }) {
    if (!getters.hasCurrentGame) {
      return
    }
    const currentGame = getters.currentGame
    dispatch('sendMessage', {
      url: '/app/game/start',
      payload: { roomName: currentGame.name }
    })
  },
  play({ getters, dispatch }, card) {
    if (!getters.hasCurrentGame) {
      return
    }
    const currentGame = getters.currentGame
    dispatch('sendMessage', {
      url: '/app/game/card',
      payload: { roomName: currentGame.name, data: card }
    })
  },
  setupMessagesChannel({ getters, dispatch }) {
    const client = getters.lobbyClient
    client.subscribe('/user/topic/game/messages', message => {
      if (!message || !message.body) {
        return
      }
      dispatch('addMessage', message)
    })
  },
  subscriptionToLobby({ getters, dispatch, commit }, message) {
    dispatch('addMessage', message)

    let body = JSON.parse(message.body)
    let currentGame = null
    if (body && body.data) {
      currentGame = body.data
    }
    if (body && !body.data) {
      currentGame = body
    }
    commit('setCurrentGame', currentGame)
    if (!currentGame || !currentGame.players) {
      return
    }
    const currentPlayer = getters.currentPlayer
    const newCurrentPlayer = currentGame.players.find(
      p => p && p.id === currentPlayer.id
    )
    if (newCurrentPlayer) {
      commit('setCurrentPlayer', newCurrentPlayer)
    }
  },
  sendMessage({ getters }, { url, payload }) {
    const client = getters.lobbyClient
    client.send(url, JSON.stringify(payload))
  },
  clearCurrentPlayer({ commit }) {
    commit('setCurrentPlayer', null)
  },
  clearCurrentGame({ commit }) {
    commit('setCurrentGame', null)
  }
}

const mutations = {
  setConnected(state, isConnected) {
    state.connected = isConnected
  },
  setCurrentPlayer(state, currentPlayer) {
    state.currentPlayer = currentPlayer
  },
  setCurrentGame(state, currentGame) {
    state.currentGame = currentGame
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
