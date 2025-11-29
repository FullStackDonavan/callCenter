<template>
  <Icon
    name="mdi:robot"
    size="32"
    class="text-blue-500 cursor-pointer hover:text-blue-600 transition"
    @click="startCall"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";

const session = ref({ history: [] });

async function startCall() {
  try {
    // Example: trigger the AI call
    const response = await fetch("/api/ai-call-agent/start", {
      method: "POST",
      body: JSON.stringify({ session: session.value }),
      headers: { "Content-Type": "application/json" },
    });
    
    const result = await response.json();
    console.log("AI call result:", result);

    // Append AI text to session
    if (result?.ai) {
      session.value.history.push({ user: result.user, ai: result.ai });
    }
  } catch (err) {
    console.error("Error starting AI call", err);
  }
}
</script>
