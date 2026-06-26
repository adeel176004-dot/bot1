const fs = require('fs');

function updateFile() {
    let code = fs.readFileSync('server.ts', 'utf-8');

    const startStr = "    // VOICE AGENT FUNCTIONALITY (Web Speech API)";
    const endStr = "startBtn.onclick = toggleRecording;";
    
    const startIndex = code.indexOf(startStr);
    const endIndex = code.indexOf(endStr) + endStr.length;
    
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
        console.error("Could not find start or end bounds!");
        process.exit(1);
    }
    
    const replaceNew = `    // VOICE AGENT FUNCTIONALITY (WebAudio + WebSockets)
    var isRecording = false;
    var ws = null;
    var inputAudioCtx = null;
    var outputAudioCtx = null;
    var mediaStream = null;
    var nextStartTime = 0;

    function pcmToBase64(pcmData) {
      var buffer = new ArrayBuffer(pcmData.length * 2);
      var view = new DataView(buffer);
      for (var i = 0; i < pcmData.length; i++) {
        var s = Math.max(-1, Math.min(1, pcmData[i]));
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
      var bytes = new Uint8Array(buffer);
      var binary = '';
      for (var i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }

    function base64ToPcm(base64) {
      var binary = atob(base64);
      var buffer = new ArrayBuffer(binary.length);
      var view = new DataView(buffer);
      for (var i = 0; i < binary.length; i++) {
        view.setUint8(i, binary.charCodeAt(i));
      }
      var int16Array = new Int16Array(buffer);
      var float32Array = new Float32Array(int16Array.length);
      for (var i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 0x8000;
      }
      return float32Array;
    }

    function playAudioChunk(outputCtx, base64) {
      var pcmMatch = base64ToPcm(base64);
      var buffer = outputCtx.createBuffer(1, pcmMatch.length, outputCtx.sampleRate);
      buffer.getChannelData(0).set(pcmMatch);
      var source = outputCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(outputCtx.destination);
      var nextStart = nextStartTime;
      if (nextStart < outputCtx.currentTime) {
        nextStart = outputCtx.currentTime;
      }
      source.start(nextStart);
      nextStartTime = nextStart + buffer.duration;
    }

    async function toggleRecording() {
        if (isRecording) {
            stopRecording();
            return;
        }

        try {
            var urlParams = new URLSearchParams({
                websiteName: websiteName,
                agentName: agentName,
                websiteContext: document.body.innerText.substring(0, 5000)
            }).toString();
            
            var wsProtocol = origin.startsWith('https') ? 'wss:' : 'ws:';
            var wsOrigin = origin.replace('http:', '').replace('https:', '');
            ws = new WebSocket(wsProtocol + '//' + wsOrigin + '/live?' + urlParams);
            
            var AudioContext = window.AudioContext || window.webkitAudioContext;
            inputAudioCtx = new AudioContext({ sampleRate: 16000 });
            outputAudioCtx = new AudioContext({ sampleRate: 24000 });
            nextStartTime = 0;

            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            var source = inputAudioCtx.createMediaStreamSource(mediaStream);
            var processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = function(e) {
                if (!ws || ws.readyState !== WebSocket.OPEN) return;
                var inputData = e.inputBuffer.getChannelData(0);
                var base64Data = pcmToBase64(inputData);
                ws.send(JSON.stringify({ audio: base64Data }));
            };
            
            source.connect(processor);
            processor.connect(inputAudioCtx.destination);

            ws.onmessage = function(event) {
                var msg = JSON.parse(event.data);
                if (msg.type === 'display_link') {
                    linkBox.style.display = 'block';
                    linkUrl.href = msg.payload.url;
                    linkUrl.innerText = msg.payload.url;
                    linkDesc.innerText = msg.payload.description;
                }
                if (msg.audio) {
                    playAudioChunk(outputAudioCtx, msg.audio);
                }
                if (msg.interrupted) {
                    nextStartTime = outputAudioCtx.currentTime;
                }
            };
            
            isRecording = true;
            statusText.innerText = 'Listening...';
            startBtn.classList.add('av-recording');
            btnText.innerText = 'Stop Speaking';
            
            if (!hasGreeted) {
                hasGreeted = true;
                statusText.innerText = 'Waking up...';
                // Note: server logic already sends greeting to model on connect
            }
        } catch(e) {
            console.error("Failed to start voice:", e);
            statusText.innerText = 'Microphone access denied.';
        }
    }

    function stopRecording() {
        if (ws) { ws.close(); ws = null; }
        if (mediaStream) { mediaStream.getTracks().forEach(function(t) { t.stop(); }); mediaStream = null; }
        if (inputAudioCtx) { inputAudioCtx.close(); inputAudioCtx = null; }
        if (outputAudioCtx) { outputAudioCtx.close(); outputAudioCtx = null; }
        
        isRecording = false;
        startBtn.classList.remove('av-recording');
        btnText.innerText = 'Start Speaking';
        statusText.innerText = 'Ready';
    }
    
    startBtn.onclick = toggleRecording;`;

    code = code.substring(0, startIndex) + replaceNew + code.substring(endIndex);
    fs.writeFileSync('server.ts', code);
    console.log("Updated server.ts successfully");
}

updateFile();
