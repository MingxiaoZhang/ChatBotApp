import logo from './logo.svg';
import './App.css';
import { Configuration, OpenAIApi } from "openai";
import React, {useState} from "react";
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import {wait} from "@testing-library/user-event/dist/utils";

const speechsdk = require('microsoft-cognitiveservices-speech-sdk')

function App() {
    const [language, setLanguage] = useState("en-US")
  const speechConfig = speechsdk.SpeechConfig.fromSubscription("daf7e8b3bf2e4d379e0848591dda5ef6", "eastus");
  speechConfig.speechRecognitionLanguage = language;

  const [disabled, setDisabled] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [reply, setReply] = useState("")
  const getText = async (text) => {
    const configuration = new Configuration({
      organization: "org-9saZtTNk7pok4fc59RgFqunZ",
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
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
    if (language === "en-US") {
        speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";
    } else {
        speechConfig.speechSynthesisVoiceName = "zh-CN-XiaochenNeural";
    }
    const synthesizer = new speechsdk.SpeechSynthesizer(speechConfig, audioConfig);
    synthesizer.speakTextAsync(
        text,
        result => {
          if (result) {
            synthesizer.close();
            console.log(result.audioDuration / 10000)
            wait(result.audioDuration / 10000).then(() => setDisabled(false))
            return result.audioData;
          }
        },
        error => {
          console.log(error);
          synthesizer.close();
        });
  }

  const speechToText = async () => {
    console.log(language)
    if (!disabled) {
      setDisabled(true)
      const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

      if (language === "en-US") {
          setPrompt("Speak into your microphone")
      } else {
          setPrompt("请对麦克风说话")
      }

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
  }

  const toggleLang = () => {
      if (document.getElementById('lang').selectedIndex === 0) {
          setLanguage("en-US")
      } else {
          setLanguage("zh-CN")
      }
  }

  return (
    <div className="App">
      <header className="App-header">
          <select id="lang" onChange={toggleLang}>
              <option value="0">English</option>
              <option value="1">中文</option>
          </select>
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
