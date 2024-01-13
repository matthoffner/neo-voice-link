const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const fetch = require('node-fetch');
const Twilio = require('twilio');
const { OpenAI } = require('openai');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const SYSTEM_PROMPT = "You are a highly intelligent and knowledgeable assistant, adept at understanding and responding to a variety of queries in a concise and friendly manner. Your responses should be clear, informative, and appropriate for a voice-based interaction, always aiming to assist the user effectively."
const PORT = 3000;
const VOICE_ID = "nWM88eUzTWbyiJW1K8NX";
const WHISPER_MODEL = "whisper-1";
const ELEVENLABS_MODEL_ID = "eleven_turbo_v2";
const OPENAI_MODEL = "gpt-3.5-turbo";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory storage for conversation histories
const conversationHistories = {};

// Function to convert audio to text using OpenAI's Whisper
async function convertAudioToText(audioData) {
  const outputPath = '/tmp/input.webm';
  fs.writeFileSync(outputPath, audioData);

  try {
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(outputPath),
      model: WHISPER_MODEL,
    });

    return response.text;
  } finally {
    fs.unlinkSync(outputPath);
  }
}

// Function to get a response from OpenAI chatbot
async function getChatbotResponse(conversation) {
  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    stream: false,
    messages: conversation,
  });

  return response.choices[0].message.content;
}

async function playIntroPhrase(twiml) {
    const introPhrase = 'Hello, how can I assist you today?';
    const audioResponse = await convertTextToVoice(introPhrase);

    twiml.play(Buffer.from(audioResponse).toString('base64'));
}

// Function to convert text to voice using ElevenLabs
async function convertTextToVoice(input) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`;
  const headers = {
    Accept: 'audio/mpeg',
    'Content-Type': 'application/json',
    'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
  };
  const data = {
    text: input,
    model_id: ELEVENLABS_MODEL_ID,
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.5,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok.');
  }

  return await response.arrayBuffer();
}

// Endpoint to handle incoming calls
app.post('/voice', async (req, res) => {
  const twiml = new Twilio.twiml.VoiceResponse();
  const callSid = req.body.CallSid;

  // Initialize conversation history if not present
  if (!conversationHistories[callSid]) {
    conversationHistories[callSid] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];
  }

  if (req.body.SpeechResult) {
    // Convert speech to text
    const userSpeech = req.body.SpeechResult;
    const text = await convertAudioToText(Buffer.from(userSpeech, 'base64'));

    // Update conversation history with user's message
    conversationHistories[callSid].push({ role: 'user', content: text });

    // Get response from OpenAI chatbot
    const chatbotResponse = await getChatbotResponse(conversationHistories[callSid]);

    // Update conversation history with chatbot's response
    conversationHistories[callSid].push({ role: 'assistant', content: chatbotResponse });

    // Convert chatbot response to voice
    const audioResponse = await convertTextToVoice(chatbotResponse);

    // Respond with audio
    twiml.play(Buffer.from(audioResponse).toString('base64'));

    // Ask for further input from the user
    twiml.gather({
      input: 'speech',
      speechTimeout: 'auto',
      action: '/voice',
    });
  } else {
    // Initial prompt to the user
    await playIntroPhrase(twiml);

    twiml.gather({
        input: 'speech',
        speechTimeout: 'auto',
        action: '/voice',
    });
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
