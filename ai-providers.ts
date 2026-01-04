export interface AIProvider {
	name: string;
	sendMessage(apiKey: string, messages: Message[], model?: string, signal?: AbortSignal): Promise<string>;
}

export interface Message {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

export class AIError extends Error {
	constructor(message: string, public provider: string, public statusCode?: number) {
		super(message);
		this.name = 'AIError';
	}
}

export class AnthropicProvider implements AIProvider {
	name = 'Anthropic';

	async sendMessage(apiKey: string, messages: Message[], model: string = 'claude-3-5-sonnet-20241022', signal?: AbortSignal): Promise<string> {
		const response = await fetch('https://api.anthropic.com/v1/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': apiKey,
				'anthropic-version': '2023-06-01'
			},
			body: JSON.stringify({
				model: model,
				max_tokens: 4096,
				messages: messages.filter(m => m.role !== 'system'),
				system: messages.find(m => m.role === 'system')?.content
			}),
			signal
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new AIError(errorText, 'Anthropic', response.status);
		}

		const data = await response.json();
		if (!data.content?.[0]?.text) {
			throw new AIError('Invalid response format', 'Anthropic');
		}
		return data.content[0].text;
	}
}

export class OpenAIProvider implements AIProvider {
	name = 'OpenAI';

	async sendMessage(apiKey: string, messages: Message[], model: string = 'gpt-4o', signal?: AbortSignal): Promise<string> {
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: model,
				messages: messages
			}),
			signal
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new AIError(errorText, 'OpenAI', response.status);
		}

		const data = await response.json();
		if (!data.choices?.[0]?.message?.content) {
			throw new AIError('Invalid response format', 'OpenAI');
		}
		return data.choices[0].message.content;
	}
}

export class GeminiProvider implements AIProvider {
	name = 'Gemini';

	async sendMessage(apiKey: string, messages: Message[], model: string = 'gemini-2.0-flash-exp', signal?: AbortSignal): Promise<string> {
		// Convert messages to Gemini format
		const contents = messages
			.filter(m => m.role !== 'system')
			.map(m => ({
				role: m.role === 'assistant' ? 'model' : 'user',
				parts: [{ text: m.content }]
			}));

		const systemInstruction = messages.find(m => m.role === 'system')?.content;

		const response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					contents: contents,
					systemInstruction: systemInstruction ? {
						parts: [{ text: systemInstruction }]
					} : undefined
				}),
				signal
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			throw new AIError(errorText, 'Gemini', response.status);
		}

		const data = await response.json();
		if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
			throw new AIError('Invalid response format', 'Gemini');
		}
		return data.candidates[0].content.parts[0].text;
	}
}

export class OpenRouterProvider implements AIProvider {
	name = 'OpenRouter';

	async sendMessage(apiKey: string, messages: Message[], model: string = 'anthropic/claude-3.5-sonnet', signal?: AbortSignal): Promise<string> {
		const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${apiKey}`,
				'HTTP-Referer': 'https://obsidian.md',
				'X-Title': 'Obsidian AI Assistant'
			},
			body: JSON.stringify({
				model: model,
				messages: messages
			}),
			signal
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new AIError(errorText, 'OpenRouter', response.status);
		}

		const data = await response.json();
		if (!data.choices?.[0]?.message?.content) {
			throw new AIError('Invalid response format', 'OpenRouter');
		}
		return data.choices[0].message.content;
	}
}

export const AI_PROVIDERS: { [key: string]: AIProvider } = {
	anthropic: new AnthropicProvider(),
	openai: new OpenAIProvider(),
	gemini: new GeminiProvider(),
	openrouter: new OpenRouterProvider()
};
