# Obsidian AI Assistant Plugin

A powerful AI assistant plugin for Obsidian that helps you edit, create, organize, and manipulate text in your documents using multiple AI services.

## Features

- **Multiple AI Provider Support**: Choose from Anthropic (Claude), OpenAI (GPT), Google (Gemini), or OpenRouter
- **Multiple Access Methods**:
  - Ribbon icon button in the sidebar
  - Keyboard shortcut (Ctrl/Cmd+Shift+A)
  - Right-click context menu
  - Command palette
- **Interactive Chat Interface**: Have conversations with AI to refine your content
- **Quick Actions**: One-click buttons for common tasks like improving writing, summarizing, expanding, and simplifying
- **Text Manipulation**:
  - Edit and improve selected text
  - Generate new content
  - Explain complex text
  - Organize and restructure content
- **Seamless Integration**: Insert AI responses directly into your notes or copy to clipboard

## Installation

1. Download the latest release from the GitHub releases page
2. Extract the files to your vault's plugins folder: `<vault>/.obsidian/plugins/obsidian-ai-assistant/`
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

### Development Installation

1. Clone this repository into your vault's plugins folder:
   ```bash
   cd <vault>/.obsidian/plugins/
   git clone https://github.com/flntfnd/ObsidianAI-Plugin.git obsidian-ai-assistant
   cd obsidian-ai-assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the plugin:
   ```bash
   npm run build
   ```

4. Reload Obsidian and enable the plugin in Settings → Community Plugins

## Configuration

1. Open Obsidian Settings
2. Navigate to AI Assistant under Plugin Options
3. Select your preferred AI provider
4. Enter your API key for the selected provider

### Getting API Keys

- **Anthropic (Claude)**: Get your API key from [console.anthropic.com](https://console.anthropic.com)
- **OpenAI (GPT)**: Get your API key from [platform.openai.com](https://platform.openai.com)
- **Google (Gemini)**: Get your API key from [aistudio.google.com](https://aistudio.google.com)
- **OpenRouter**: Get your API key from [openrouter.ai](https://openrouter.ai)

## Usage

### Opening the AI Assistant

There are multiple ways to open the AI Assistant:

1. **Ribbon Icon**: Click the robot icon in the left sidebar
2. **Keyboard Shortcut**: Press `Ctrl+Shift+A` (Windows/Linux) or `Cmd+Shift+A` (Mac)
3. **Right-click Menu**: Right-click anywhere in the editor and select "AI Assistant"
4. **Command Palette**: Press `Ctrl+P` or `Cmd+P`, then search for "Open AI Assistant"

### Quick Actions

The AI Assistant includes quick action buttons for common tasks:

- **Improve Writing**: Enhance clarity, grammar, and writing quality
- **Summarize**: Create concise summaries of your text
- **Expand**: Add more details and examples
- **Simplify**: Make complex text easier to understand

### Working with Selected Text

1. Select any text in your note
2. Right-click and choose:
   - **AI Edit Selection**: Ask AI to edit and improve the selected text
   - **AI Explain Selection**: Get an explanation of the selected text
3. Or use the quick action buttons in the AI Assistant modal

### Inserting AI Responses

After receiving an AI response, you can:

- **Insert at Cursor**: Add the response at your current cursor position
- **Replace Selection**: Replace the selected text with the AI response
- **Copy to Clipboard**: Copy the response for use elsewhere

### Example Prompts

- "Rewrite this paragraph to be more professional"
- "Create a summary of the key points"
- "Expand on this idea with examples"
- "Fix grammar and spelling errors"
- "Convert this to a bulleted list"
- "Make this more concise"
- "Explain this concept in simpler terms"

## Commands

The plugin adds the following commands to Obsidian:

- **Open AI Assistant**: Opens the AI chat interface
- **AI Quick Edit Selected Text**: Quickly edit selected text with AI
- **AI Generate Content**: Generate new content based on your instructions

You can assign custom keyboard shortcuts to these commands in Obsidian Settings → Hotkeys.

## Privacy & Security

- API keys are stored locally in your Obsidian vault
- All AI requests are sent directly to your chosen provider
- No data is sent to any third-party servers (except your chosen AI provider)
- Your conversations are not logged or stored by this plugin

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Development build with watch mode
npm run dev

# Production build
npm run build
```

### Project Structure

- `main.ts`: Main plugin code with UI and commands
- `ai-providers.ts`: AI service provider implementations
- `manifest.json`: Plugin metadata
- `package.json`: NPM dependencies and scripts

## Supported AI Providers

### Anthropic (Claude)
- Claude 3.5 Sonnet
- Claude 3.5 Haiku
- Claude 3 Opus

### OpenAI (GPT)
- GPT-4o
- GPT-4o Mini
- GPT-4 Turbo

### Google (Gemini)
- Gemini 2.0 Flash (Experimental)
- Gemini 1.5 Pro
- Gemini 1.5 Flash

### OpenRouter
- Access to multiple models through OpenRouter's API
- Supports any model available on OpenRouter

## Troubleshooting

### "Please configure your API key in settings"
- Make sure you've entered a valid API key in the plugin settings
- Verify the API key is for the correct provider you've selected

### API Errors
- Check that your API key is valid and has not expired
- Ensure you have sufficient credits/quota with your AI provider
- Check your internet connection

### Plugin Not Loading
- Make sure you've enabled the plugin in Settings → Community Plugins
- Try reloading Obsidian
- Check the console for error messages (Ctrl+Shift+I or Cmd+Option+I)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

If you encounter any issues or have feature requests, please [open an issue](https://github.com/flntfnd/ObsidianAI-Plugin/issues) on GitHub.

## Credits

Built with the Obsidian Plugin API and powered by leading AI providers.
