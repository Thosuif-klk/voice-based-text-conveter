/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Copy, Trash2, Check, Volume2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const processText = (text: string) => {
    const wordMap: Record<string, string> = {
      // Polite words
      "please": "🙏",
      "thank you": "😇",
      "thanks": "✨",
      "sorry": "🙇",
      "apologize": "🙇",
      "welcome": "🤝",
      "kind": "🌸",
      "gentle": "🍃",
      "pardon": "🎩",
      "excuse": "🎩",
      "hello": "👋",
      "hi": "👋",
      
      // Cunning words
      "whisper": "🤫",
      "whispers": "🤫",
      "secret": "🕵️",
      "secrets": "🕵️",
      "silent": "🤐",
      "advantage": "📈",
      "catch": "🕸️",
      "miss": "💨",
      "ears": "👂",
      "ink": "🖋️",
      "witness": "👁️",
      "cunning": "🦊",
      "clever": "🧠",
      "smart": "💡",
      "trick": "🃏",
      "plan": "🗺️",
      "scheme": "♟️",
      "hidden": "🌑",
      "shadow": "👤",
      "trap": "🪤",
    };

    let processed = text;
    // Sort keys by length descending to handle phrases before single words
    const sortedKeys = Object.keys(wordMap).sort((a, b) => b.length - a.length);
    
    for (const word of sortedKeys) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      processed = processed.replace(regex, (match) => `${match} ${wordMap[word.toLowerCase()]}`);
    }
    
    return processed;
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Speech Recognition API is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final) {
        setTranscript((prev) => prev + (prev ? ' ' : '') + processText(final));
      }
      setInterimTranscript(processText(interim));
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError("Microphone access denied. Please enable microphone permissions.");
      } else {
        setError(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start(); // Auto-restart if we're supposed to be listening
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setError(null);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start recognition:", err);
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-orange-500/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-24 flex flex-col min-h-screen">
        {/* Header */}
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <Sparkles className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-orange-500/80">Voice Intelligence</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-light tracking-tight mb-6"
          >
            Vasanth<span className="font-semibold italic">Transcribe</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-zinc-400 max-w-xl leading-relaxed"
          >
            Walls have ears, but Vasanth is the silent witness. Speak your mind—I'll catch the whispers others miss and turn them into your advantage.
          </motion.p>
        </header>

        {/* Main Controls */}
        <section className="flex-grow flex flex-col gap-12">
          {/* Record Button */}
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleListening}
              className={`
                relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500
                ${isListening 
                  ? 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)]' 
                  : 'bg-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.3)]'}
              `}
            >
              <AnimatePresence mode="wait">
                {isListening ? (
                  <motion.div
                    key="mic-off"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                  >
                    <MicOff className="w-10 h-10 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="mic-on"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                  >
                    <Mic className="w-10 h-10 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Pulse Effect */}
              {isListening && (
                <motion.div 
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 bg-red-500 rounded-full"
                />
              )}
            </motion.button>
          </div>

          <div className="relative group">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full min-h-[300px] p-8 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl flex flex-col"
            >
              {/* Transcript Display */}
              <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
                {transcript || interimTranscript ? (
                  <div className="space-y-4">
                    <p className="text-xl md:text-2xl leading-relaxed text-zinc-200 whitespace-pre-wrap">
                      {transcript}
                      <span className="text-zinc-500 italic"> {interimTranscript}</span>
                    </p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4">
                    <Volume2 className="w-12 h-12 opacity-20" />
                    <p className="text-lg font-light italic">Your words will appear here...</p>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="mt-8 pt-6 border-t border-zinc-800/50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    disabled={!transcript}
                    className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm font-medium"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={clearTranscript}
                    disabled={!transcript && !interimTranscript}
                    className="p-3 rounded-xl bg-zinc-800 hover:bg-red-900/30 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm font-medium"
                    title="Clear all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {isListening && (
                    <>
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                      />
                      <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                        Listening...
                      </span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-red-900/20 border border-red-900/50 rounded-2xl text-red-400 text-sm flex items-center gap-3"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Footer */}
        <footer className="mt-24 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600 text-xs uppercase tracking-widest font-mono">
          <p>© 2026 Vasanth Transcribe AI</p>
          <div className="flex gap-6">
            <span className="hover:text-zinc-400 cursor-help">Privacy</span>
            <span className="hover:text-zinc-400 cursor-help">Terms</span>
            <span className="hover:text-zinc-400 cursor-help">API</span>
          </div>
        </footer>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
}
