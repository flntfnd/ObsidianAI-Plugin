export interface SpeechSettings {
	enableSpeechRecognition: boolean;
	speechLanguage: string;
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
