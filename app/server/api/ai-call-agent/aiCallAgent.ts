// server/aiCallAgent.js
import fetch from "node-fetch";
import FormData from "form-data"; // make sure you installed "form-data"
import { Readable } from "stream";
import { createReadStream } from "fs";
import { PassThrough } from "stream";

// Whisper API (Docker)
const WHISPER_URL = "http://localhost:9000/api/transcribe";

// Mistral API (Docker)
const MISTRAL_URL = "http://localhost:5003/api/generate";

// ElevenLabs API
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_URL = `https://api.elevenlabs.io/v1/text-to-speech/YOUR_VOICE_ID`;

export async function processAudio(audioBuffer, session) {
  const form = new FormData();

  // Convert Buffer to a Readable stream and append as 'file'
  const stream = Readable.from(audioBuffer);
  form.append("file", stream, {
    filename: "speech.wav",
    contentType: "audio/wav",
  });

  const whisperResp = await fetch(WHISPER_URL, {
    method: "POST",
    body: form,
    headers: form.getHeaders(), // important for Node FormData
  });

  const { text } = await whisperResp.json();
  console.log("Caller said:", text);

  if (!text) return null;

  // 2. Ask Mistral for a response
  const mistralResp = await fetch(MISTRAL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: text,
      history: session.history || []
    })
  });

  const { response } = await mistralResp.json();
  console.log("AI says:", response);

  // Store in session history for context
  session.history = [...(session.history || []), { user: text, ai: response }];

  // 3. Convert to speech with ElevenLabs
  const elevenResp = await fetch(ELEVENLABS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text: response,
      voice_settings: { stability: 0.5, similarity_boost: 0.7 }
    })
  });

  const audioBufferResp = Buffer.from(await elevenResp.arrayBuffer());

  return audioBufferResp; // send this back into Twilio
}
