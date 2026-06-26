import WebSocket from 'ws';
const ws = new WebSocket('ws://localhost:3000/live?systemPrompt=Hello');
ws.on('open', () => {
  console.log("Connected");
  ws.send(JSON.stringify({
    clientContent: {
      turns: [{ role: 'user', parts: [{ text: 'Hello, how are you?' }] }],
      turnComplete: true
    }
  }));
});
ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.serverContent) {
     console.log("Server Content Parts:", msg.serverContent.modelTurn?.parts?.map(p => p.inlineData ? "AUDIO_DATA" : p.text));
  }
});
setTimeout(() => { ws.close(); process.exit(0); }, 5000);
