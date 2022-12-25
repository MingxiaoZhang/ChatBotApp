import logo from './logo.svg';
import './App.css';
import { Configuration, OpenAIApi } from "openai";
import React, {useState} from "react";
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';

const speechsdk = require('microsoft-cognitiveservices-speech-sdk')

function App() {
  const speechConfig = speechsdk.SpeechConfig.fromSubscription("daf7e8b3bf2e4d379e0848591dda5ef6", "eastus");
  speechConfig.speechRecognitionLanguage = 'en-US';

  const [prompt, setPrompt] = useState("")
  const [reply, setReply] = useState("")
  const getText = async (text) => {
    const configuration = new Configuration({
      organization: "org-9saZtTNk7pok4fc59RgFqunZ",
      apiKey: process.env.OPEN_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: text,
      max_tokens: 100,
      temperature: 0,
    });
    console.log(response.data["choices"][0]["text"])
    setReply(response.data["choices"][0]["text"])
    return response.data["choices"][0]["text"]
  }

  const textToSpeech = async (text) => {
    const audioConfig = speechsdk.AudioConfig.fromDefaultSpeakerOutput();
    speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";
    const synthesizer = new speechsdk.SpeechSynthesizer(speechConfig, audioConfig);
    synthesizer.speakTextAsync(
        text,
        result => {
          if (result) {
            synthesizer.close();
            return result.audioData;
          }
        },
        error => {
          console.log(error);
          synthesizer.close();
        });
  }

  const speechToText = async () => {
    const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

    setPrompt("Speak into your microphone")

    recognizer.recognizeOnceAsync(async result => {
      let displayText;
      if (result.reason === ResultReason.RecognizedSpeech) {
        displayText = `${result.text}`
      } else {
        displayText = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
      }
      setPrompt(displayText)
      let text = await getText(displayText)
      await textToSpeech(text)
    });
  }

  return (
    <div className="App">
      <header className="App-header">
        <span onClick={speechToText}>
          <img src={logo} className="App-logo" alt="logo" />
        </span>
        <p>
          {prompt}
        </p>
        <p>
          {reply}
        </p>
      </header>
    </div>
  );
}

export default App;
