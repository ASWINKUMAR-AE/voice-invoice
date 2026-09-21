export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private ws: WebSocket | null = null;
  private isRecording = false;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(
    private onTranscription: (text: string) => void,
    private onError: (error: string) => void
  ) {}

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      console.warn("⚠️ ScriptProcessorNode is deprecated. Use AudioWorkletNode in production.");

      await this.setupWebSocket();

      this.processor.onaudioprocess = (event) => {
        if (!this.isRecording || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const input = event.inputBuffer.getChannelData(0);
        const int16 = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
          int16[i] = Math.max(-32768, Math.min(32767, input[i] * 32768));
        }

        this.ws.send(int16.buffer);
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];
      this.mediaRecorder.ondataavailable = (e) => this.audioChunks.push(e.data);
      this.mediaRecorder.start();

      this.isRecording = true;
      console.log("🎙️ Recording started");
    } catch (err) {
      this.onError("Failed to start recording: " + err);
    }
  }

  private async fetchRealtimeToken(): Promise<string> {
    const response = await fetch("http://localhost:5000/api/token");
    const data = await response.json();

    if (!data.token) throw new Error("Invalid token from backend");

    return data.token;
  }

  private async setupWebSocket(): Promise<void> {
    try {
      const token = await this.fetchRealtimeToken();

      const params = new URLSearchParams({
        sample_rate: "16000",
        word_boost: JSON.stringify(["invoice", "customer", "quantity", "rupees"]),
        format_text: "true"
      });

      this.ws = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?token=${token}&${params.toString()}`);

      this.ws.onopen = () => console.log("✅ WebSocket connected");

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.message_type === "FinalTranscript" && data.text) {
          this.onTranscription(data.text);
        } else if (data.error) {
          this.onError("AssemblyAI error: " + data.error);
        }
      };

      this.ws.onerror = () => this.onError("WebSocket error");
      this.ws.onclose = (e) => console.log("🔌 WebSocket closed", e.code, e.reason);
    } catch (err) {
      this.onError("Failed to authenticate WebSocket: " + err);
    }
  }

  stopRecording(): void {
    this.isRecording = false;

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.processor) this.processor.disconnect();
    if (this.source) this.source.disconnect();
    if (this.audioContext) this.audioContext.close();

    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ terminate_session: true }));
      }
      this.ws.close();
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }

    this.saveRecording();
    console.log("🛑 Recording stopped");
  }

  private saveRecording(): void {
    if (this.audioChunks.length > 0) {
      const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
      const reader = new FileReader();

      reader.onload = () => {
        const base64 = reader.result as string;
        const recordings = JSON.parse(localStorage.getItem('voiceRecordings') || '[]');
        recordings.push({
          id: Date.now().toString(),
          audioData: base64,
          transcription: '',
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem('voiceRecordings', JSON.stringify(recordings));
        console.log("💾 Saved recording to localStorage");
      };

      reader.readAsDataURL(blob);
    }
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }
}
