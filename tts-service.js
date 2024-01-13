const EventEmitter = require("events");
const { WaveFile } = require("wavefile");

class TextToSpeechService extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.config.voiceId ||= process.env.VOICE_ID;
  }

  async generate(text) {
    const outputFormat = "pcm_16000";
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${this.config.voiceId}/stream?output_format=${outputFormat}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.XI_API_KEY,
          "Content-Type": "application/json",
          accept: "audio/wav",
        },
        body: JSON.stringify({
          model_id: process.env.XI_MODEL_ID,
          text,
        }),
      }
    );
    console.log(`Response status from elevenlabs: ${response.status}`);

    try {
      const audioArrayBuffer = await response.arrayBuffer();
      let bufferToUse = audioArrayBuffer;

      // Check if the buffer length is a multiple of 2
      if (audioArrayBuffer.byteLength % 2 !== 0) {
        console.warn("Audio Array Buffer length is not a multiple of 2, adjusting the buffer.");
        
        // Create a new buffer with an extra byte
        bufferToUse = new ArrayBuffer(audioArrayBuffer.byteLength + 1);

        // Create a new view for the original buffer
        const originalView = new Uint8Array(audioArrayBuffer);
        
        // Create a new view for the new buffer
        const newView = new Uint8Array(bufferToUse);

        // Copy the original buffer into the new buffer
        newView.set(originalView);

        // Optionally, set the last byte to zero (if needed)
        newView[newView.length - 1] = 0;
      }

      const wav = new WaveFile();
      wav.fromScratch(1, 16000, '16', new Int16Array(bufferToUse));
      wav.toSampleRate(8000);
      wav.toMuLaw();
      const label = text;
      // Do not send the WAV headers (that's why `data.samples`)
      this.emit("speech", Buffer.from(wav.data.samples).toString("base64"), label);
    } catch (err) {
      console.error("Error occurred in TextToSpeech service");
      console.error(err);
    }
  }
}

module.exports = { TextToSpeechService };
