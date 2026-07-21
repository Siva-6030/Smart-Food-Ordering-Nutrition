import { useState, useRef, useEffect } from "react";

// Web Speech API is browser-native — no external package needed.
// Supported in Chrome, Edge, Safari (partial). Falls back gracefully if unavailable.
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceSearch({ onResult }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(!!SpeechRecognition);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, [onResult]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  if (!supported) return null; // hide the mic button entirely on unsupported browsers

  return (
    <button
      type="button"
      onClick={toggleListening}
      title="Search by voice"
      className={`px-3 py-2 rounded-xl text-sm transition-colors ${
        listening ? "bg-red-500 text-white animate-pulse" : "bg-white/70 dark:bg-white/10"
      }`}
    >
      {listening ? "🎙️ Listening..." : "🎤"}
    </button>
  );
}
