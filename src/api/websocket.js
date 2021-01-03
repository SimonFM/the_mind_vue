import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';

export default {
  instance: null,
  socket: null,
  getInstance() {
    if (!this.instance || !this.socket) {
      this.socket = new SockJS('http://127.0.0.1:9999/mindfulness/ws');
      this.instance = Stomp.over(this.socket);
    }
    return this.instance;
  }
}