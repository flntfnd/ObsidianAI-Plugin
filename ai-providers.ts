export interface AIProvider {
	name: string;
	sendMessage(apiKey: string, messages: Message[], model?: string): Promise<string>;
}

export interface Message {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

export class AnthropicProvider implements AIProvider {
	name = 'Anthropic';

	async sendMessage(apiKey: string, messages: Message[], model: string = 'claude-3-5-sonnet-20241022'): Promise<string> {
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
			})
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Anthropic API error: ${error}`);
		}

		const data = await response.json();
		return data.content[0].text;
	}
}

export class OpenAIProvider implements AIProvider {
	name = 'OpenAI';

	async sendMessage(apiKey: string, messages: Message[], model: string = 'gpt-4o'): Promise<string> {
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: model,
				messages: messages
			})
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`OpenAI API error: ${error}`);
		}

		const data = await response.json();
		return data.choices[0].message.content;
	}
}

export class GeminiProvider implements AIProvider {
	name = 'Gemini';

	async sendMessage(apiKey: string, messages: Message[], model: string = 'gemini-2.0-flash-exp'): Promise<string> {
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
				})
			}
		);

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Gemini API error: ${error}`);
		}

		const data = await response.json();
		return data.candidates[0].content.parts[0].text;
	}
}

export class OpenRouterProvider implements AIProvider {
	name = 'OpenRouter';

	async sendMessage(apiKey: string, messages: Message[], model: string = 'anthropic/claude-3.5-sonnet'): Promise<string> {
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
			})
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`OpenRouter API error: ${error}`);
		}

		const data = await response.json();
		return data.choices[0].message.content;
	}
}

export const AI_PROVIDERS: { [key: string]: AIProvider } = {
	anthropic: new AnthropicProvider(),
	openai: new OpenAIProvider(),
	gemini: new GeminiProvider(),
	openrouter: new OpenRouterProvider()
};
