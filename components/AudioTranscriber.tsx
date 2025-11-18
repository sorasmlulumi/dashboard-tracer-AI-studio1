import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from '@google/genai';
// FIX: Import missing SpeechToTextIcon component.
import { CloseIcon, MicrophoneIcon, StopIcon, SpeechToTextIcon } from './icons';

// Base64 encoding/decoding functions for audio data
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

interface AudioTranscriberProps {
  isOpen: boolean;
  onClose: () => void;
}

const AudioTranscriber: React.FC<AudioTranscriberProps> = ({ isOpen, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);

  const stopRecording = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => session.close());
        sessionPromiseRef.current = null;
    }
    setIsRecording(false);
  };
  
  const startRecording = async () => {
    setError(null);
    setTranscription('');
    if (isRecording) return;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                inputAudioTranscription: {},
                responseModalities: [Modality.AUDIO], // Required but we won't process audio out
            },
            callbacks: {
                onopen: () => { console.log('Live session opened.'); },
                onclose: () => { console.log('Live session closed.'); },
                onerror: (e) => {
                    console.error('Live session error:', e);
                    setError('An error occurred with the connection.');
                    stopRecording();
                },
                onmessage: (msg: LiveServerMessage) => {
                    if (msg.serverContent?.inputTranscription) {
                        setTranscription(prev => prev + msg.serverContent.inputTranscription.text);
                    }
                },
            }
        });
        
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const source = audioContextRef.current.createMediaStreamSource(stream);
        scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
            }
            const base64 = encode(new Uint8Array(int16.buffer));
            
            if (sessionPromiseRef.current) {
                 sessionPromiseRef.current.then(session => {
                    session.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
                 });
            }
        };

        source.connect(scriptProcessorRef.current);
        scriptProcessorRef.current.connect(audioContextRef.current.destination);
        setIsRecording(true);

    } catch (err) {
        console.error("Error starting recording:", err);
        setError("Could not access microphone. Please check permissions.");
        setIsRecording(false);
    }
  };
  
  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      stopRecording();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-xl h-auto max-h-[80vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b dark:border-slate-700">
          <div className="flex items-center">
            <SpeechToTextIcon className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold ml-2 dark:text-white">Audio Transcription</h2>
          </div>
          <button onClick={() => { stopRecording(); onClose(); }} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
            <CloseIcon className="h-6 w-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex flex-col items-center justify-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              {isRecording ? <StopIcon className="h-10 w-10 text-white" /> : <MicrophoneIcon className="h-10 w-10 text-white" />}
            </button>
            <p className="mt-4 text-lg font-medium dark:text-gray-300">
              {isRecording ? 'Recording...' : 'Tap to Start Recording'}
            </p>
          </div>
          
          {error && <p className="text-center text-red-500">{error}</p>}

          <textarea
            value={transcription}
            readOnly
            placeholder="Your transcribed text will appear here..."
            className="w-full h-48 p-3 mt-4 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioTranscriber;