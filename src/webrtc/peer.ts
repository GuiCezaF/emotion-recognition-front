export class Peer {
  peer_conn: RTCPeerConnection;
  data_chann: RTCDataChannel;

  //TODO: adicionar tratamento de erros
  //TODO: refatorar para melhorar o codigo

  constructor() {
    this.peer_conn = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    this.data_chann = this.peer_conn.createDataChannel("frames");
    this.data_chann.onopen = () => console.log("DataChannel aberto");
    this.data_chann.onmessage = (e) =>
      console.log("Mensagem recebida:", e.data);

    this.peer_conn.onicecandidate = (event) => {
      if (event.candidate) console.log("ICE candidate:", event.candidate);
    };

    this.peer_conn.onconnectionstatechange = () =>
      console.log("Connection state:", this.peer_conn.connectionState);
  }

  async sendOffer(url: string) {
    const offer = await this.peer_conn.createOffer();
    await this.peer_conn.setLocalDescription(offer);

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(this.peer_conn.localDescription),
    });

    const answer = await resp.json();
    await this.peer_conn.setRemoteDescription(answer);
    console.log("Conexão estabelecida com backend");
  }

  async addVideoStream(stream: MediaStream) {
    stream
      .getVideoTracks()
      .forEach((track) => this.peer_conn.addTrack(track, stream));
  }

  stop() {
    this.peer_conn.close();
    this.data_chann.close();
  }
}
