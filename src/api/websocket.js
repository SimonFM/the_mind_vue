import SockJS from 'sockjs-client'
import Stomp from 'webstomp-client'

export default {
  instance: null,
  socket: null,
  getInstance() {
    if (!this.instance || !this.socket) {
      this.socket = new SockJS(process.env.VUE_APP_MIND_SERVER_URL)
      this.instance = Stomp.over(this.socket)
    }
    return this.instance
  }
}
