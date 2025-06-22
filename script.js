let recording = false;
let mediaRecorder;
let socket;
const output = document.getElementById("output");
const btn = document.getElementById("recordBtn");

btn.onclick = async () => {
  if (!recording) {
    // To start recording 
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    const deepgramApiKey = "API key here";

    socket = new WebSocket(`wss://api.deepgram.com/v1/listen?punctuate=true`, [
      "token",
      deepgramApiKey,
    ]);

    socket.onopen = () => {
      mediaRecorder.addEventListener("dataavailable", event => {
        if (event.data.size > 0 && socket.readyState === 1) {
          socket.send(event.data);
        }
      });
      mediaRecorder.start(250); // Send audio every 250ms
    };

    socket.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.channel && data.channel.alternatives[0]) {
        const transcript = data.channel.alternatives[0].transcript;
        if (transcript) {
          output.value += transcript + " ";
        }
      }
    };

    socket.onerror = console.error;

    btn.textContent = "Stop Listening";
    recording = true;
  } else {
    // to stop recording
    mediaRecorder.stop();
    socket.close();
    btn.textContent = "Start Listening";
    recording = false;
  }
};
