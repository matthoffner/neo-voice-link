# neo-voice-link

## Overview

neo-voice-link is a sophisticated voice assistant application that integrates Twilio's communication capabilities, OpenAI's Whisper and GPT-3.5 models, and ElevenLabs' text-to-speech technology. This combination creates an interactive and intelligent voice-based experience over phone calls, enabling users to engage in conversations with an AI-powered assistant.

## Features

- **Telephony Integration**: Uses Twilio for handling voice calls, allowing users to interact with the assistant via phone.
- **Voice-to-Text Conversion**: Leverages OpenAI's Whisper model to accurately transcribe user speech into text.
- **AI-Powered Chatbot**: Employs OpenAI's GPT-3.5 model to generate contextually relevant and coherent responses.
- **Text-to-Voice Conversion**: Utilizes ElevenLabs' advanced text-to-speech technology to provide natural-sounding voice responses.
- **Conversation Context Management**: Maintains a conversation history for each session to ensure continuity and context in interactions.

## Setup

### Prerequisites

- Node.js installed on your system.
- Twilio account with a configured phone number.
- API keys for OpenAI and ElevenLabs.

### Installation

1. Clone the repository or download the source code.
2. Install necessary dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
* OPENAI_API_KEY: Your OpenAI API key.
* NEXT_PUBLIC_ELEVENLABS_API_KEY: Your ElevenLabs API key.

### Running the Application

1. Start the server:
```bash
node app.js
```

2. The server will start on the specified port (default 3000).
3. Configure your Twilio phone number to forward incoming calls to your server's /voice endpoint.


### Usage
Call the Twilio phone number associated with your account. You will be greeted by the Neo-Voice-Link assistant and can start interacting by speaking. The assistant will respond to your queries with spoken answers.
