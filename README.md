# Star-AI Core

Build a complete modern AI assistant web application called "Star-AI".

The application must have two AI versions:

1. Star-AI 2.0

2. Star-AI 3.0

IMPORTANT:

Star-AI 3.0 must be presented as the more advanced and powerful version compared to Star-AI 2.0.

========================================

BRAND

========================================

App name:

Star-AI

Versions:

Star-AI 2.0

Star-AI 3.0

Create a futuristic AI branding system with a premium, polished interface.

The logo should contain a stylized star combined with an AI/technology concept.

========================================

VERSION SWITCHER

========================================

Create a prominent version selector in the main interface.

Users can switch between:

- Star-AI 2.0

- Star-AI 3.0

When the user switches versions:

1. The entire visual theme should smoothly change.

2. The background should change.

3. Accent colors should change.

4. Animations should change.

5. The AI personality/system behavior should change.

6. The model configuration should change.

7. The welcome screen should change.

8. The available capabilities should change.

Use a smooth transition animation when switching versions.

Do NOT simply change the text label. Make each version feel like a different generation of the same AI.

========================================

STAR-AI 2.0

========================================

Theme:

Modern futuristic technology.

Use a dark blue/purple futuristic background with subtle animated particles and stars.

Capabilities:

- General conversation

- Question answering

- Text generation

- Summarization

- Translation

- Coding assistance

- Mathematics

- Creative writing

- Basic reasoning

The interface should feel fast, simple and reliable.

Display a small badge:

"Star-AI 2.0"

Subtitle:

"Smart AI for everyday tasks"

========================================

STAR-AI 3.0

========================================

Star-AI 3.0 must be clearly presented as the more advanced version.

Theme:

More futuristic and premium than Star-AI 2.0.

Use a deep space / cosmic background with animated stars, subtle nebula effects, glowing particles and advanced animations.

Use a different visual identity from 2.0 while keeping the Star-AI brand recognizable.

Capabilities:

- Advanced reasoning

- Complex problem solving

- Coding

- Debugging

- Mathematics

- Translation

- Long-form writing

- Summarization

- Creative generation

- Data analysis

- Multi-step reasoning

- File understanding

- Image understanding if supported by the connected AI API

- Conversation memory

- Context-aware responses

Display a badge:

"Star-AI 3.0"

Subtitle:

"Advanced intelligence for complex tasks"

Add a visual indicator:

"Advanced Mode"

========================================

AI BACKEND

========================================

Do not create a fake AI chatbot.

The application must be architected so that a real AI API can be connected.

Create a secure backend/API layer.

NEVER expose API keys in frontend JavaScript.

Use environment variables for API keys.

Create a clean AI provider abstraction so the application can support different AI providers/models.

For example:

AIProvider

- sendMessage()

- streamMessage()

- analyzeImage()

- analyzeFile()

Star-AI 2.0 and Star-AI 3.0 must use separate model configurations.

Create configuration such as:

STAR_AI_2_MODEL

STAR_AI_3_MODEL

The exact model names must be configurable through environment variables rather than hardcoded throughout the application.

========================================

CHAT SYSTEM

========================================

Create a full ChatGPT-style chat interface.

Features:

- New conversation

- Conversation history

- Rename conversation

- Delete conversation

- Search conversations

- Pin conversation

- Clear conversation

- Copy response

- Regenerate response

- Stop generating

- Edit user message

- Retry response

- Markdown rendering

- Code blocks

- Syntax highlighting

- Copy code button

- Streaming responses

- Auto-scroll

- Message timestamps

The user should be able to continue conversations naturally.

========================================

SIDEBAR

========================================

Create a responsive sidebar.

Include:

Star-AI logo

Version selector

New Chat button

Conversation history

Search conversations

Settings

User profile

Help

On mobile, the sidebar should become a slide-out drawer.

========================================

HOME SCREEN

========================================

Create a beautiful welcome screen.

Show:

"Welcome to Star-AI"

Then dynamically display:

"Star-AI 2.0"

or

"Star-AI 3.0"

depending on the selected version.

Show capability cards.

For Star-AI 2.0:

"Ask anything"

"Write"

"Translate"

"Code"

For Star-AI 3.0:

"Advanced Reasoning"

"Code & Debug"

"Analyze"

"Create"

"Understand Files"

"Complex Problems"

Add example prompts that users can click.

========================================

PROMPT INPUT

========================================

Create a premium message composer.

Features:

- Text input

- Send button

- Stop button while generating

- Attach file button

- Image upload if supported

- Voice input UI

- Model/version indicator

- Character/token usage indicator if available

The composer should expand vertically as the user types.

Pressing Enter sends the message.

Shift + Enter creates a new line.

========================================

FILE SUPPORT

========================================

Add support for uploading common files:

- PDF

- TXT

- DOCX

- CSV

- JSON

- Images

Create a file attachment preview before sending.

The architecture should allow files to be passed to the AI backend.

If a particular AI provider does not support a file type, handle it gracefully.

========================================

MEMORY

========================================

Add an optional AI memory system.

Users should be able to enable/disable memory.

Create:

Memory settings

Saved memories

Delete memory

Clear all memories

Do not store sensitive information unnecessarily.

========================================

SETTINGS

========================================

Create a complete settings page.

Sections:

General

Appearance

AI

Memory

Privacy

Notifications

Keyboard shortcuts

About

Appearance settings:

- Dark mode

- Light mode

- System

- Background intensity

- Animations on/off

- Particle effects on/off

AI settings:

- Default version

- Response style

- Temperature if supported

- Streaming on/off

========================================

PERSONALITY

========================================

Allow users to choose AI response style:

- Balanced

- Creative

- Precise

- Friendly

- Professional

- Short

- Detailed

Apply these settings to the AI system configuration.

========================================

VERSION-SPECIFIC BACKGROUNDS

========================================

This is VERY IMPORTANT.

When switching from Star-AI 2.0 to Star-AI 3.0:

Star-AI 2.0:

Use a blue/purple technology background.

Star-AI 3.0:

Use a deep cosmic space background with stars and nebula-like effects.

The transition should be animated and visually impressive.

Do not reload the entire page.

Use React state to dynamically switch themes.

Create a reusable ThemeProvider / VersionTheme system.

========================================

RESPONSIVE DESIGN

========================================

The application must work perfectly on:

- Desktop

- Laptop

- Tablet

- Mobile

The mobile interface must not feel like a shrunken desktop website.

========================================

SECURITY

========================================

Never expose AI API keys in frontend code.

Use secure server-side functions/API routes.

Validate user input.

Add basic rate limiting architecture.

Do not trust client-provided model names.

The backend must determine which model is used for Star-AI 2.0 and Star-AI 3.0.

========================================

DATABASE

========================================

Use Supabase if available.

Create database structures for:

users

conversations

messages

user_settings

memories

file_metadata

Use appropriate relationships and timestamps.

Users should only be able to access their own conversations and memories.

Implement proper Row Level Security.

========================================

AUTHENTICATION

========================================

Create authentication UI:

- Sign up

- Login

- Logout

- Forgot password

Support:

Email/password

Structure the application so additional authentication providers can be added later.

========================================

ADMIN PANEL

========================================

Create a basic admin dashboard.

Admin should be able to see:

- Total users

- Active users

- Number of conversations

- Number of messages

- AI version usage

- Basic usage statistics

Do not expose admin functions to normal users.

========================================

UI/UX

========================================

Design style:

Premium

Futuristic

Minimal

Smooth

Professional

Use:

- Glassmorphism

- Subtle gradients

- Soft shadows

- Smooth transitions

- Modern cards

- Rounded corners

- High-quality typography

Do not overuse animations.

The interface should remain fast and usable.

========================================

ERROR HANDLING

========================================

Create friendly error states.

Examples:

"Star-AI is temporarily unavailable."

"Something went wrong. Please try again."

"Your file could not be processed."

"Your message is too long."

Never expose raw server errors or API keys.

========================================

LOADING STATES

========================================

Create beautiful AI generation states.

Instead of a generic spinner, show:

Star-AI animated thinking indicator.

For Star-AI 3.0, use a more advanced animation.

========================================

ARCHITECTURE

========================================

Use clean, modular architecture.

Separate:

components

pages

services

AI providers

database

authentication

themes

hooks

utilities

Create reusable components.

Do not put the entire application into one component.

========================================

IMPORTANT IMPLEMENTATION RULE

========================================

Build the application as a REAL working AI platform architecture, not a static mockup.

If an external AI API key is not available yet:

1. Build the complete frontend.

2. Build the backend/API abstraction.

3. Create environment variable placeholders.

4. Clearly show where the API key should be added.

5. Do not fake AI responses.

The application should be ready for a real AI API connection.

========================================

FINAL GOAL

========================================

The final product should feel like a real AI platform called:

STAR-AI

with two generations:

⭐ Star-AI 2.0

Modern everyday AI

⭐ Star-AI 3.0

Advanced next-generation AI

The two versions must have noticeably different themes, backgrounds, animations, capabilities and AI configurations.

Make Star-AI 3.0 feel like a major upgrade over Star-AI 2.0.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://star-ai-pmstudio.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/539ce172-cd90-4170-8d6d-77af404a9515).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
