# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-01-04

### Added
- **Speech Recognition (Voice Input)**:
  - Click microphone button to dictate messages
  - Real-time speech-to-text conversion
  - Visual indicator when listening (pulsing red button)
  - Support for 14+ languages
- **Text-to-Speech (Voice Output)**:
  - Speaker button on all AI responses
  - Read aloud functionality with play/pause control
  - Adjustable voice speed (0.5x - 2.0x)
  - Adjustable voice pitch (0.5 - 2.0)
- **Speech Settings**:
  - Toggle speech recognition on/off
  - Toggle text-to-speech on/off
  - Language selection dropdown
  - Voice speed and pitch sliders
- Enhanced modal UI with button container for speech controls
- Improved message display with flex layout for speaker buttons
- Automatic cleanup of speech services on modal close

### Changed
- Updated README with comprehensive speech feature documentation
- Enhanced CSS with speech button animations and styling
- Improved modal layout to accommodate speech controls

## [1.0.0] - 2026-01-04

### Added
- Initial release of AI Assistant plugin
- Support for multiple AI providers:
  - Anthropic (Claude 3.5 Sonnet, Haiku, Opus)
  - OpenAI (GPT-4o, GPT-4o Mini, GPT-4 Turbo)
  - Google Gemini (2.0 Flash, 1.5 Pro, 1.5 Flash)
  - OpenRouter (multiple models)
- Interactive chat interface with conversation history
- Three activation methods:
  - Ribbon icon button
  - Keyboard shortcut (Cmd/Ctrl+Shift+A)
  - Right-click context menu
- Quick action buttons:
  - Improve Writing
  - Summarize
  - Expand
  - Simplify
- Text manipulation features:
  - Insert at cursor
  - Replace selection
  - Copy to clipboard
- Secure API key storage (password-masked inputs)
- Request cancellation support
- Proper error handling and validation
- Responsive design for mobile devices

### Security
- API keys are stored securely in Obsidian's data storage
- Password-masked input fields for API keys
- No third-party data transmission except to selected AI provider
