export interface SpeechSettings {
	enableSpeechRecognition: boolean;
	enableTextToSpeech: boolean;
	speechLanguage: string;
	voiceName?: string;
	voiceRate: number;
	voicePitch: number;
}

export class SpeechRecognitionService {
	private recognition: any;
	private isListening = false;
	private onResultCallback?: (transcript: string) => void;
	private onEndCallback?: () => void;

	constructor() {
		// Check if browser supports speech recognition
		const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

		if (SpeechRecognition) {
			this.recognition = new SpeechRecognition();
			this.recognition.continuous = false;
			this.recognition.interimResults = true;
			this.recognition.maxAlternatives = 1;
		}
	}

	isSupported(): boolean {
		return !!this.recognition;
	}

	startListening(language: string, onResult: (transcript: string) => void, onEnd: () => void): void {
		if (!this.recognition || this.isListening) return;

		this.recognition.lang = language;
		this.onResultCallback = onResult;
		this.onEndCallback = onEnd;

		this.recognition.onresult = (event: any) => {
			const transcript = event.results[0][0].transcript;
			if (this.onResultCallback) {
				this.onResultCallback(transcript);
			}
		};

		this.recognition.onend = () => {
			this.isListening = false;
			if (this.onEndCallback) {
				this.onEndCallback();
			}
		};

		this.recognition.onerror = (event: any) => {
			console.error('Speech recognition error:', event.error);
			this.isListening = false;
			if (this.onEndCallback) {
				this.onEndCallback();
			}
		};

		this.recognition.start();
		this.isListening = true;
	}

	stopListening(): void {
		if (this.recognition && this.isListening) {
			this.recognition.stop();
			this.isListening = false;
		}
	}

	getIsListening(): boolean {
		return this.isListening;
	}
}

export class TextToSpeechService {
	private synthesis: SpeechSynthesis;
	private currentUtterance?: SpeechSynthesisUtterance;
	private isSpeaking = false;

	constructor() {
		this.synthesis = window.speechSynthesis;
	}

	isSupported(): boolean {
		return 'speechSynthesis' in window;
	}

	getVoices(): SpeechSynthesisVoice[] {
		return this.synthesis.getVoices();
	}

	speak(text: string, settings: SpeechSettings, onEnd?: () => void): void {
		if (!this.isSupported() || this.isSpeaking) return;

		// Cancel any ongoing speech
		this.stop();

		this.currentUtterance = new SpeechSynthesisUtterance(text);
		this.currentUtterance.lang = settings.speechLanguage;
		this.currentUtterance.rate = settings.voiceRate;
		this.currentUtterance.pitch = settings.voicePitch;

		// Set voice if specified
		if (settings.voiceName) {
			const voices = this.getVoices();
			const voice = voices.find(v => v.name === settings.voiceName);
			if (voice) {
				this.currentUtterance.voice = voice;
			}
		}

		this.currentUtterance.onstart = () => {
			this.isSpeaking = true;
		};

		this.currentUtterance.onend = () => {
			this.isSpeaking = false;
			if (onEnd) onEnd();
		};

		this.currentUtterance.onerror = (event) => {
			console.error('Text-to-speech error:', event);
			this.isSpeaking = false;
			if (onEnd) onEnd();
		};

		this.synthesis.speak(this.currentUtterance);
	}

	stop(): void {
		if (this.synthesis.speaking) {
			this.synthesis.cancel();
			this.isSpeaking = false;
		}
	}

	pause(): void {
		if (this.synthesis.speaking && !this.synthesis.paused) {
			this.synthesis.pause();
		}
	}

	resume(): void {
		if (this.synthesis.paused) {
			this.synthesis.resume();
		}
	}

	getIsSpeaking(): boolean {
		return this.isSpeaking;
	}

	isPaused(): boolean {
		return this.synthesis.paused;
	}
}
