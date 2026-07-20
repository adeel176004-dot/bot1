const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3000/live?userId=test&websiteName=Voice%20Agent');
ws.on('open', () => {
    console.log('connected');
    ws.send(JSON.stringify({ type: 'context', payload: 'test context' }));
    setTimeout(() => process.exit(0), 5000);
});
ws.on('message', (data) => console.log('message length:', data.toString().length));
ws.on('error', (err) => console.log('error:', err));
ws.on('close', () => console.log('closed'));
