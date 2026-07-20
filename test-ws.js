const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3000/live?userId=test&websiteName=Voice%20Agent');
ws.on('open', () => {
    console.log('connected');
    ws.send(JSON.stringify({ type: 'context', payload: 'test context' }));
    ws.send(JSON.stringify({ audio: 'SGVsbG8=' })); // some fake base64
});
ws.on('message', (data) => console.log('message:', data.toString()));
ws.on('error', (err) => console.log('error:', err));
ws.on('close', () => console.log('closed'));
