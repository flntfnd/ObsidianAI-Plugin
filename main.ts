import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, Menu } from 'obsidian';
import { AI_PROVIDERS, Message, AIError } from './ai-providers';
import { SpeechRecognitionService, SpeechSettings } from './speech-service';

interface AIAssistantSettings extends SpeechSettings {
	selectedProvider: string;
	anthropicApiKey: string;
	openaiApiKey: string;
	geminiApiKey: string;
	openrouterApiKey: string;
	anthropicModel: string;
	openaiModel: string;
	geminiModel: string;
	openrouterModel: string;
}

const DEFAULT_SETTINGS: AIAssistantSettings = {
	selectedProvider: 'anthropic',
	anthropicApiKey: '',
	openaiApiKey: '',
	geminiApiKey: '',
	openrouterApiKey: '',
	anthropicModel: 'claude-3-5-sonnet-20241022',
	openaiModel: 'gpt-4o',
	geminiModel: 'gemini-2.0-flash-exp',
	openrouterModel: 'anthropic/claude-3.5-sonnet',
	enableSpeechRecognition: true,
	speechLanguage: 'en-US'
};

export default class AIAssistantPlugin extends Plugin {
	settings: AIAssistantSettings;

	async onload() {
		await this.loadSettings();

		// Add ribbon icon
		this.addRibbonIcon('bot', 'AI Assistant', (evt: MouseEvent) => {
			this.openAIModal();
		});

		// Add command with keyboard shortcut
		this.addCommand({
			id: 'open-ai-assistant',
			name: 'Open AI Assistant',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.openAIModal(editor);
			},
			hotkeys: [{ modifiers: ["Mod", "Shift"], key: "a" }]
		});

		// Add command for quick edit
		this.addCommand({
			id: 'ai-quick-edit',
			name: 'AI Quick Edit Selected Text',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selectedText = editor.getSelection();
				if (selectedText) {
					this.openAIModal(editor, `Edit and improve the following text:\n\n${selectedText}`);
				} else {
					new Notice('Please select some text first');
				}
			}
		});

		// Add command for content generation
		this.addCommand({
			id: 'ai-generate-content',
			name: 'AI Generate Content',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.openAIModal(editor, 'Generate content based on my instructions:');
			}
		});

		// Add context menu
		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu: Menu, editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();

				menu.addItem((item) => {
					item
						.setTitle('AI Assistant')
						.setIcon('bot')
						.onClick(async () => {
							this.openAIModal(editor);
						});
				});

				if (selection) {
					menu.addItem((item) => {
						item
							.setTitle('AI Edit Selection')
							.setIcon('wand-2')
							.onClick(async () => {
								this.openAIModal(editor, `Edit and improve the following text:\n\n${selection}`);
							});
					});

					menu.addItem((item) => {
						item
							.setTitle('AI Explain Selection')
							.setIcon('help-circle')
							.onClick(async () => {
								this.openAIModal(editor, `Explain the following text:\n\n${selection}`);
							});
					});
				}
			})
		);

		// Add settings tab
		this.addSettingTab(new AIAssistantSettingTab(this.app, this));
	}

	openAIModal(editor?: Editor, initialPrompt?: string) {
		new AIAssistantModal(this.app, this, editor, initialPrompt).open();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	getApiKey(): string {
		const provider = this.settings.selectedProvider;
		switch (provider) {
			case 'anthropic':
				return this.settings.anthropicApiKey;
			case 'openai':
				return this.settings.openaiApiKey;
			case 'gemini':
				return this.settings.geminiApiKey;
			case 'openrouter':
				return this.settings.openrouterApiKey;
			default:
				return '';
		}
	}

	getModel(): string {
		const provider = this.settings.selectedProvider;
		switch (provider) {
			case 'anthropic':
				return this.settings.anthropicModel;
			case 'openai':
				return this.settings.openaiModel;
			case 'gemini':
				return this.settings.geminiModel;
			case 'openrouter':
				return this.settings.openrouterModel;
			default:
				return '';
		}
	}
}

class AIAssistantModal extends Modal {
	plugin: AIAssistantPlugin;
	editor?: Editor;
	conversationHistory: Message[] = [];
	chatContainer: HTMLElement;
	inputContainer: HTMLElement;
	textArea: HTMLTextAreaElement;
	sendButton: HTMLButtonElement;
	cancelButton?: HTMLButtonElement;
	micButton?: HTMLButtonElement;
	abortController?: AbortController;
	systemMessageAdded = false;
	speechRecognition: SpeechRecognitionService;

	constructor(app: App, plugin: AIAssistantPlugin, editor?: Editor, initialPrompt?: string) {
		super(app);
		this.plugin = plugin;
		this.editor = editor;
		this.speechRecognition = new SpeechRecognitionService();

		if (initialPrompt) {
			this.conversationHistory.push({
				role: 'user',
				content: initialPrompt
			});
		}
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('ai-assistant-modal');

		// Add title
		contentEl.createEl('h2', { text: 'AI Assistant' });

		// Create chat container
		this.chatContainer = contentEl.createDiv('ai-chat-container');
		this.chatContainer.style.maxHeight = '400px';
		this.chatContainer.style.overflowY = 'auto';
		this.chatContainer.style.marginBottom = '1em';
		this.chatContainer.style.padding = '1em';
		this.chatContainer.style.border = '1px solid var(--background-modifier-border)';
		this.chatContainer.style.borderRadius = '5px';

		// Create input container
		this.inputContainer = contentEl.createDiv('ai-input-container');
		this.inputContainer.style.display = 'flex';
		this.inputContainer.style.gap = '0.5em';

		// Create text area
		this.textArea = this.inputContainer.createEl('textarea');
		this.textArea.placeholder = 'Ask AI to edit, create, or organize your text...';
		this.textArea.style.flex = '1';
		this.textArea.style.minHeight = '80px';
		this.textArea.style.resize = 'vertical';
		this.textArea.style.padding = '0.5em';

		// Create button container
		const buttonContainer = this.inputContainer.createDiv('ai-button-container');
		buttonContainer.style.display = 'flex';
		buttonContainer.style.flexDirection = 'column';
		buttonContainer.style.gap = '0.5em';

		// Create microphone button if speech recognition is enabled
		if (this.plugin.settings.enableSpeechRecognition && this.speechRecognition.isSupported()) {
			this.micButton = buttonContainer.createEl('button', { text: '🎤' });
			this.micButton.addClass('ai-mic-button');
			this.micButton.style.padding = '0.5em';
			this.micButton.title = 'Voice input (click to speak)';
			this.micButton.addEventListener('click', () => this.toggleSpeechRecognition());
		}

		// Create send button
		this.sendButton = buttonContainer.createEl('button', { text: 'Send' });
		this.sendButton.style.padding = '0.5em 1.5em';

		this.sendButton.addEventListener('click', () => this.sendMessage());

		// Add keyboard shortcut (Ctrl/Cmd + Enter)
		this.textArea.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				this.sendMessage();
			}
		});

		// Add action buttons
		const actionContainer = contentEl.createDiv('ai-action-container');
		actionContainer.style.marginTop = '1em';
		actionContainer.style.display = 'flex';
		actionContainer.style.gap = '0.5em';
		actionContainer.style.flexWrap = 'wrap';

		// Quick action buttons
		this.createQuickActionButton(actionContainer, 'Improve Writing', 'Improve the writing quality, clarity, and grammar of the selected text.');
		this.createQuickActionButton(actionContainer, 'Summarize', 'Provide a concise summary of the selected text.');
		this.createQuickActionButton(actionContainer, 'Expand', 'Expand on the selected text with more details and examples.');
		this.createQuickActionButton(actionContainer, 'Simplify', 'Simplify the selected text to make it easier to understand.');

		// If there's an initial prompt, display it but don't auto-send
		if (this.conversationHistory.length > 0) {
			this.displayMessage(this.conversationHistory[0]);
			// Optionally add a send button to proceed
			const sendInitialButton = actionContainer.createEl('button', { text: 'Send Request' });
			sendInitialButton.style.padding = '0.5em 1em';
			sendInitialButton.style.fontWeight = 'bold';
			sendInitialButton.addEventListener('click', () => {
				this.sendMessage();
				sendInitialButton.remove();
			});
		}

		// Focus on text area
		this.textArea.focus();
	}

	createQuickActionButton(container: HTMLElement, label: string, prompt: string) {
		const button = container.createEl('button', { text: label });
		button.style.padding = '0.3em 0.8em';
		button.style.fontSize = '0.9em';
		button.addEventListener('click', () => {
			if (this.editor) {
				const selection = this.editor.getSelection();
				if (selection) {
					this.textArea.value = `${prompt}\n\n${selection}`;
				} else {
					this.textArea.value = prompt;
				}
			} else {
				this.textArea.value = prompt;
			}
			this.textArea.focus();
		});
	}

	displayMessage(message: Message) {
		const messageEl = this.chatContainer.createDiv('ai-message');
		messageEl.style.marginBottom = '1em';
		messageEl.style.padding = '0.5em';
		messageEl.style.borderRadius = '5px';

		if (message.role === 'user') {
			messageEl.style.backgroundColor = 'var(--background-secondary)';
			messageEl.style.marginLeft = '2em';
		} else {
			messageEl.style.backgroundColor = 'var(--background-primary-alt)';
			messageEl.style.marginRight = '2em';
		}

		const roleEl = messageEl.createEl('strong');
		roleEl.textContent = message.role === 'user' ? 'You: ' : 'AI: ';

		const contentEl = messageEl.createEl('span');
		contentEl.textContent = message.content;

		// Scroll to bottom
		this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
	}

	async sendMessage() {
		const userMessage = this.textArea.value.trim();
		if (!userMessage && this.conversationHistory.length === 0) {
			new Notice('Please enter a message');
			return;
		}

		// Check if API key is configured
		const apiKey = this.plugin.getApiKey();
		if (!apiKey) {
			new Notice('Please configure your API key in settings');
			return;
		}

		// Add user message to history if there's new input
		if (userMessage) {
			const message: Message = {
				role: 'user',
				content: userMessage
			};
			this.conversationHistory.push(message);
			this.displayMessage(message);
		}

		// Clear input
		this.textArea.value = '';
		this.sendButton.disabled = true;
		this.textArea.disabled = true;
		this.sendButton.textContent = 'Thinking...';

		// Create abort controller for cancellation
		this.abortController = new AbortController();

		// Show cancel button
		if (!this.cancelButton) {
			this.cancelButton = this.inputContainer.createEl('button', { text: 'Cancel' });
			this.cancelButton.style.padding = '0.5em 1em';
			this.cancelButton.addEventListener('click', () => this.cancelRequest());
		}
		this.cancelButton.style.display = 'block';

		try {
			// Add system message only once
			const messages = [...this.conversationHistory];
			if (!this.systemMessageAdded) {
				messages.unshift({
					role: 'system',
					content: 'You are a helpful AI assistant integrated into Obsidian, a note-taking app. Help the user edit, create, organize, and manipulate their text. Be concise and helpful. When editing text, provide the edited version clearly.'
				});
				this.systemMessageAdded = true;
			}

			// Send to AI
			const provider = AI_PROVIDERS[this.plugin.settings.selectedProvider];
			const model = this.plugin.getModel();
			const response = await provider.sendMessage(apiKey, messages, model, this.abortController.signal);

			// Add AI response to history
			const aiMessage: Message = {
				role: 'assistant',
				content: response
			};

			this.conversationHistory.push(aiMessage);
			this.displayMessage(aiMessage);

			// If editor is available, offer to insert/replace
			if (this.editor) {
				this.offerTextAction(response);
			}

		} catch (error) {
			if (error instanceof Error && error.name === 'AbortError') {
				new Notice('Request cancelled');
			} else if (error instanceof AIError) {
				new Notice(`${error.provider} API Error: ${error.statusCode || 'Unknown'}`);
				console.error('AI Assistant error:', error);
			} else if (error instanceof Error) {
				new Notice(`Error: ${error.message}`);
				console.error('AI Assistant error:', error);
			} else {
				new Notice('An unknown error occurred');
				console.error('AI Assistant error:', error);
			}
		} finally {
			this.sendButton.disabled = false;
			this.textArea.disabled = false;
			this.sendButton.textContent = 'Send';
			if (this.cancelButton) {
				this.cancelButton.style.display = 'none';
			}
			this.abortController = undefined;
			this.textArea.focus();
		}
	}

	cancelRequest() {
		if (this.abortController) {
			this.abortController.abort();
		}
	}

	toggleSpeechRecognition() {
		if (!this.micButton) return;

		if (this.speechRecognition.getIsListening()) {
			this.speechRecognition.stopListening();
			this.micButton.textContent = '🎤';
			this.micButton.removeClass('ai-mic-listening');
		} else {
			this.micButton.textContent = '⏺️';
			this.micButton.addClass('ai-mic-listening');
			this.speechRecognition.startListening(
				this.plugin.settings.speechLanguage,
				(transcript) => {
					this.textArea.value = transcript;
				},
				() => {
					if (this.micButton) {
						this.micButton.textContent = '🎤';
						this.micButton.removeClass('ai-mic-listening');
					}
				}
			);
		}
	}

	offerTextAction(text: string) {
		const actionEl = this.chatContainer.createDiv('ai-action-buttons');
		actionEl.style.marginTop = '0.5em';
		actionEl.style.display = 'flex';
		actionEl.style.gap = '0.5em';

		const insertButton = actionEl.createEl('button', { text: 'Insert at Cursor' });
		insertButton.style.padding = '0.3em 0.8em';
		insertButton.style.fontSize = '0.85em';
		insertButton.addEventListener('click', () => {
			if (this.editor) {
				this.editor.replaceSelection(text);
				new Notice('Text inserted');
			}
		});

		const replaceButton = actionEl.createEl('button', { text: 'Replace Selection' });
		replaceButton.style.padding = '0.3em 0.8em';
		replaceButton.style.fontSize = '0.85em';
		replaceButton.addEventListener('click', () => {
			if (this.editor) {
				const selection = this.editor.getSelection();
				if (selection) {
					this.editor.replaceSelection(text);
					new Notice('Text replaced');
				} else {
					this.editor.replaceSelection(text);
					new Notice('Text inserted');
				}
			}
		});

		const copyButton = actionEl.createEl('button', { text: 'Copy to Clipboard' });
		copyButton.style.padding = '0.3em 0.8em';
		copyButton.style.fontSize = '0.85em';
		copyButton.addEventListener('click', () => {
			navigator.clipboard.writeText(text);
			new Notice('Copied to clipboard');
		});
	}

	onClose() {
		// Cancel any ongoing request
		if (this.abortController) {
			this.abortController.abort();
		}

		// Stop speech recognition if active
		if (this.speechRecognition.getIsListening()) {
			this.speechRecognition.stopListening();
		}

		// Clean up
		const { contentEl } = this;
		contentEl.empty();
	}
}

class AIAssistantSettingTab extends PluginSettingTab {
	plugin: AIAssistantPlugin;

	constructor(app: App, plugin: AIAssistantPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'AI Assistant Settings' });

		// Provider selection
		new Setting(containerEl)
			.setName('AI Provider')
			.setDesc('Select which AI service to use')
			.addDropdown(dropdown => dropdown
				.addOption('anthropic', 'Anthropic (Claude)')
				.addOption('openai', 'OpenAI (GPT)')
				.addOption('gemini', 'Google (Gemini)')
				.addOption('openrouter', 'OpenRouter')
				.setValue(this.plugin.settings.selectedProvider)
				.onChange(async (value) => {
					this.plugin.settings.selectedProvider = value;
					await this.plugin.saveSettings();
					this.display(); // Refresh to show relevant settings
				}));

		// Anthropic settings
		if (this.plugin.settings.selectedProvider === 'anthropic') {
			containerEl.createEl('h3', { text: 'Anthropic Settings' });

			new Setting(containerEl)
				.setName('Anthropic API Key')
				.setDesc('Enter your Anthropic API key from console.anthropic.com')
				.addText(text => {
					text.setPlaceholder('sk-ant-...')
						.setValue(this.plugin.settings.anthropicApiKey)
						.onChange(async (value) => {
							this.plugin.settings.anthropicApiKey = value;
							await this.plugin.saveSettings();
						});
					text.inputEl.type = 'password';
				});

			new Setting(containerEl)
				.setName('Model')
				.setDesc('Select the Anthropic model to use')
				.addDropdown(dropdown => dropdown
					.addOption('claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet')
					.addOption('claude-3-5-haiku-20241022', 'Claude 3.5 Haiku')
					.addOption('claude-3-opus-20240229', 'Claude 3 Opus')
					.setValue(this.plugin.settings.anthropicModel)
					.onChange(async (value) => {
						this.plugin.settings.anthropicModel = value;
						await this.plugin.saveSettings();
					}));
		}

		// OpenAI settings
		if (this.plugin.settings.selectedProvider === 'openai') {
			containerEl.createEl('h3', { text: 'OpenAI Settings' });

			new Setting(containerEl)
				.setName('OpenAI API Key')
				.setDesc('Enter your OpenAI API key from platform.openai.com')
				.addText(text => {
					text.setPlaceholder('sk-...')
						.setValue(this.plugin.settings.openaiApiKey)
						.onChange(async (value) => {
							this.plugin.settings.openaiApiKey = value;
							await this.plugin.saveSettings();
						});
					text.inputEl.type = 'password';
				});

			new Setting(containerEl)
				.setName('Model')
				.setDesc('Select the OpenAI model to use')
				.addDropdown(dropdown => dropdown
					.addOption('gpt-4o', 'GPT-4o')
					.addOption('gpt-4o-mini', 'GPT-4o Mini')
					.addOption('gpt-4-turbo', 'GPT-4 Turbo')
					.setValue(this.plugin.settings.openaiModel)
					.onChange(async (value) => {
						this.plugin.settings.openaiModel = value;
						await this.plugin.saveSettings();
					}));
		}

		// Gemini settings
		if (this.plugin.settings.selectedProvider === 'gemini') {
			containerEl.createEl('h3', { text: 'Google Gemini Settings' });

			new Setting(containerEl)
				.setName('Gemini API Key')
				.setDesc('Enter your Google AI API key from aistudio.google.com')
				.addText(text => {
					text.setPlaceholder('AIza...')
						.setValue(this.plugin.settings.geminiApiKey)
						.onChange(async (value) => {
							this.plugin.settings.geminiApiKey = value;
							await this.plugin.saveSettings();
						});
					text.inputEl.type = 'password';
				});

			new Setting(containerEl)
				.setName('Model')
				.setDesc('Select the Gemini model to use')
				.addDropdown(dropdown => dropdown
					.addOption('gemini-2.0-flash-exp', 'Gemini 2.0 Flash (Experimental)')
					.addOption('gemini-1.5-pro', 'Gemini 1.5 Pro')
					.addOption('gemini-1.5-flash', 'Gemini 1.5 Flash')
					.setValue(this.plugin.settings.geminiModel)
					.onChange(async (value) => {
						this.plugin.settings.geminiModel = value;
						await this.plugin.saveSettings();
					}));
		}

		// OpenRouter settings
		if (this.plugin.settings.selectedProvider === 'openrouter') {
			containerEl.createEl('h3', { text: 'OpenRouter Settings' });

			new Setting(containerEl)
				.setName('OpenRouter API Key')
				.setDesc('Enter your OpenRouter API key from openrouter.ai')
				.addText(text => {
					text.setPlaceholder('sk-or-...')
						.setValue(this.plugin.settings.openrouterApiKey)
						.onChange(async (value) => {
							this.plugin.settings.openrouterApiKey = value;
							await this.plugin.saveSettings();
						});
					text.inputEl.type = 'password';
				});

			new Setting(containerEl)
				.setName('Model')
				.setDesc('Enter the model name (e.g., anthropic/claude-3.5-sonnet)')
				.addText(text => text
					.setPlaceholder('anthropic/claude-3.5-sonnet')
					.setValue(this.plugin.settings.openrouterModel)
					.onChange(async (value) => {
						this.plugin.settings.openrouterModel = value;
						await this.plugin.saveSettings();
					}));
		}

		// Speech settings
		containerEl.createEl('h3', { text: 'Voice Input Settings' });

		new Setting(containerEl)
			.setName('Enable Voice Input')
			.setDesc('Allow voice input using your microphone')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableSpeechRecognition)
				.onChange(async (value) => {
					this.plugin.settings.enableSpeechRecognition = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Language')
			.setDesc('Language for speech recognition')
			.addDropdown(dropdown => dropdown
				.addOption('en-US', 'English (US)')
				.addOption('en-GB', 'English (UK)')
				.addOption('es-ES', 'Spanish (Spain)')
				.addOption('es-MX', 'Spanish (Mexico)')
				.addOption('fr-FR', 'French')
				.addOption('de-DE', 'German')
				.addOption('it-IT', 'Italian')
				.addOption('pt-BR', 'Portuguese (Brazil)')
				.addOption('pt-PT', 'Portuguese (Portugal)')
				.addOption('ru-RU', 'Russian')
				.addOption('ja-JP', 'Japanese')
				.addOption('ko-KR', 'Korean')
				.addOption('zh-CN', 'Chinese (Simplified)')
				.addOption('zh-TW', 'Chinese (Traditional)')
				.setValue(this.plugin.settings.speechLanguage)
				.onChange(async (value) => {
					this.plugin.settings.speechLanguage = value;
					await this.plugin.saveSettings();
				}));

		// Help section
		containerEl.createEl('h3', { text: 'Usage' });
		const usageDiv = containerEl.createDiv();
		usageDiv.innerHTML = `
			<p>You can access the AI Assistant in multiple ways:</p>
			<ul>
				<li><strong>Ribbon Icon:</strong> Click the robot icon in the left sidebar</li>
				<li><strong>Keyboard Shortcut:</strong> Press Ctrl/Cmd+Shift+A</li>
				<li><strong>Right-click Menu:</strong> Right-click in the editor and select "AI Assistant"</li>
				<li><strong>Command Palette:</strong> Search for "AI Assistant" commands</li>
				<li><strong>Voice Input:</strong> Click the microphone button (🎤) to dictate your message</li>
			</ul>
		`;
	}
}
