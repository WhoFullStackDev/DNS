import * as dgram from "dgram";

const udpSocket: dgram.Socket = dgram.createSocket("udp4");

udpSocket.on("message", (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
  try {
    console.log(`Received data from ${remoteAddr.address}:${remoteAddr.port}`);
    const response = Buffer.from("");
    udpSocket.send(response, remoteAddr.port, remoteAddr.address);
  } catch (e) {
    console.log(`Error sending data: ${e}`);
  }
});

udpSocket.bind(2053, "127.0.0.1");
