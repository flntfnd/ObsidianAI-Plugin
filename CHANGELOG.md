# Changelog

All notable changes to this project will be documented in this file.

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
