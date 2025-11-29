import { readFileSync } from "fs";
import { processAudio } from "./aiCallAgent";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { session } = body;

    // Use readFileSync from fs (ESM)
    const audioBuffer = readFileSync("./public/test-speech.wav");

    const aiAudio = await processAudio(audioBuffer, session);

    return {
      user: session.history?.slice(-1)?.[0]?.user || "Caller said something",
      ai: session.history?.slice(-1)?.[0]?.ai || "AI response",
      audioLength: aiAudio?.length || 0,
    };
  } catch (err: any) {
    console.error("AI call error:", err);
    return {
      error: true,
      message: err.message || "Unknown server error",
    };
  }
});
