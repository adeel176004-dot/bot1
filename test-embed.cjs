const http = require('http');

http.get('http://localhost:3000/embed.js', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    if (data.includes('SpeechSynthesisUtterance')) {
      console.log('STILL HAS SpeechSynthesisUtterance!');
    } else {
      console.log('Does NOT have SpeechSynthesisUtterance.');
    }
  });
});
