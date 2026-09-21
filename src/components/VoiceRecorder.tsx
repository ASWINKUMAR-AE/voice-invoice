import React, { useState, useRef, useCallback } from 'react';
import {
  Mic, MicOff, Square, Volume2, Wifi, WifiOff, AlertCircle
} from 'lucide-react';
import { AudioRecorder } from '../utils/audioRecorder';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  isOffline: boolean;
  language: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscription,
  isOffline,
  language,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioLevelRef = useRef<NodeJS.Timeout | null>(null);

  const handleTranscription = useCallback((text: string) => {
    console.log('Transcription received:', text);
    setIsTranscribing(true);
    onTranscription(text);
    setTimeout(() => setIsTranscribing(false), 2000);
  }, [onTranscription]);

  const handleError = useCallback((error: string) => {
    console.error('Audio recording error:', error);
    setError(error);
    setIsRecording(false);
    setIsTranscribing(false);
    setTimeout(() => setError(null), 5000);
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setPermissionGranted(false);
      setError('Microphone access denied. Please allow microphone access and try again.');
      return false;
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      const hasPermission = await checkMicrophonePermission();
      if (!hasPermission) return;

      audioRecorderRef.current = new AudioRecorder(
        handleTranscription,
        handleError
      );

      await audioRecorderRef.current.startRecording();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      audioLevelRef.current = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);

    } catch (error) {
      console.error('Failed to start recording:', error);
      handleError('Failed to start recording. Please check your microphone and try again.');
    }
  };

  const stopRecording = () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stopRecording();
      audioRecorderRef.current = null;
    }

    setIsRecording(false);
    setAudioLevel(0);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (audioLevelRef.current) {
      clearInterval(audioLevelRef.current);
      audioLevelRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Voice Recording</h2>
        <div className="flex items-center gap-2">
          {isOffline ? (
            <div className="flex items-center gap-1 text-red-600">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm">Offline</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-green-600">
              <Wifi className="w-4 h-4" />
              <span className="text-sm">Online</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Recording Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {permissionGranted === false && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 font-medium">Microphone Access Required</p>
          <p className="text-yellow-700 text-sm">Please allow microphone access to use voice recording.</p>
        </div>
      )}

      <div className="text-center">
        <div className="mb-6">
          <div className="relative mx-auto w-32 h-32 mb-4">
            <div className={`absolute inset-0 rounded-full border-4 transition-all duration-300 ${
              isRecording ? 'border-red-500 animate-pulse' : 'border-gray-300'
            }`}>
              <div className={`absolute inset-2 rounded-full transition-all duration-150 ${
                isRecording ? 'bg-red-500' : 'bg-gray-200'
              }`} style={{
                opacity: isRecording ? 0.3 + (audioLevel / 100) * 0.7 : 0.3
              }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  {isRecording ? (
                    <Volume2 className="w-8 h-8 text-red-600" />
                  ) : (
                    <Mic className="w-8 h-8 text-gray-600" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {isRecording && (
            <div className="mb-4">
              <div className="text-2xl font-mono text-red-600 mb-2">
                {formatTime(recordingTime)}
              </div>
              <div className="text-sm text-gray-600">Recording in progress...</div>
              <div className="mt-2 flex justify-center">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}

          {isTranscribing && (
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-sm">Processing speech...</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isTranscribing || permissionGranted === false}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              <Mic className="w-5 h-5" />
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              <Square className="w-5 h-5" />
              Stop Recording
            </button>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          <p className="mb-2">
            <strong>How to use:</strong>
          </p>
          <ul className="text-left space-y-1">
            <li>• Click "Start Recording" and speak clearly</li>
            <li>• Mention customer name, items, quantities, and prices</li>
            <li>• Example: "Customer name is John Doe, item laptop quantity 2 rate 50000"</li>
            <li>• Click "Stop Recording" when finished</li>
            <li>• Wait for transcription to complete</li>
          </ul>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>Note: This feature requires a modern browser with microphone support.</p>
        </div>
      </div>
    </div>
  );
};
