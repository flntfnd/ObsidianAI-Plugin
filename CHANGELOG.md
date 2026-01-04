# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-01-04

### Added
- **Voice Input (Speech-to-Text)**:
  - Microphone button for voice dictation
  - Real-time speech-to-text conversion
  - Visual indicator when listening (pulsing red button)
  - Support for 14+ languages
  - Automatic transcription to text input field
- **Voice Input Settings**:
  - Toggle voice input on/off
  - Language selection dropdown
- Enhanced modal UI with button container for voice controls
- Automatic cleanup of speech recognition on modal close

### Changed
- Updated README with voice input documentation
- Added CSS with microphone button animations
- Streamlined settings panel for voice input only

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
