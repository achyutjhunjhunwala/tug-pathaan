<p align="center">
  <h1 align="center">⚡ tug-pathaan</h1>
  <p align="center">
    <em>AI-powered research assistant that thinks with Gemini and speaks through your Google Home.</em>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/node-%3E%3D22-brightgreen?style=flat-square" alt="node">
    <img src="https://img.shields.io/badge/Gemini-CLI-4285F4?style=flat-square&logo=google&logoColor=white" alt="gemini">
    <img src="https://img.shields.io/badge/Google%20Home-TTS-FF6F00?style=flat-square&logo=googlehome&logoColor=white" alt="google home">
  </p>
</p>

---

## What is this?

**Pathaan** is a Node.js CLI tool that reads research prompts from `.spec.md` files, executes them against **Google's Gemini CLI**, and does two things with the result:

1. **Saves** a timestamped Markdown report to a local `history/` folder
2. **Announces** the findings on your **Google Home** speaker via a Home Assistant TTS API running on a Raspberry Pi (Outside of the scope of this project, but you can use something like [tug-ghome-notifier](http://tugpi:3000) for that)

Think of it as a personal AI research pipeline — define your prompts once, run them anytime, and get the results read out loud.

---

## How It Works

```
┌──────────────┐      ┌─────────────┐      ┌───────────────────┐
│  .spec.md    │ ───▸ │  Gemini CLI │ ───▸ │  Pathaan Engine   │
│  (prompt)    │      │  (research) │      │                   │
└──────────────┘      └─────────────┘      │  ┌─────────────┐  │
                                           │  │ Save to MD   │  │
                                           │  │ history/     │  │
                                           │  └─────────────┘  │
                                           │  ┌─────────────┐  │
                                           │  │ POST to API  │──│──▸ 🔊 Google Home
                                           │  │ (TTS notify) │  │
                                           │  └─────────────┘  │
                                           └───────────────────┘
```

---

## Prerequisites

| Requirement | Details |
|---|---|
| **Node.js** | v22+ (uses native `fetch`) |
| **Gemini CLI** | Installed and authenticated (`npm i -g @anthropic-ai/gemini-cli` or equivalent) |
| **TTS API** | A running instance of [tug-ghome-notifier](http://tugpi:3000) on your Raspberry Pi |

---

## Setup

```bash
git clone <repo-url> tug-pathaan
cd tug-pathaan
npm install
```

---

## Usage

```bash
node pathaan.js <specfile>
```

**Example:**

```bash
node pathaan.js ai-news.spec.md
```

Forgot the filename? Just run it bare:

```bash
node pathaan.js
```

```
Hey AJ, did you forget the spec file? Please use one of the files from here:

  → ai-news.spec.md
  → demo.spec.md
  → stock-analysis.spec.md

Usage: node pathaan.js <specfile>
```

---

## Spec Files

All prompts live in the `spec/` directory as `.spec.md` files. Each file contains a Markdown-formatted prompt that gets sent to Gemini in headless mode.

**Creating a new spec:**

```bash
touch spec/my-research.spec.md
```

Write your prompt inside, and you're good to go.

---

## Output & History

Every run saves the Gemini response as a timestamped Markdown file under `history/`.

```
history/
├── ai-news/
│   ├── ai-news-2026-02-20-09:30:15.md
│   └── ai-news-2026-02-21-09:30:22.md
├── demo/
│   └── demo-2026-02-20-14:00:05.md
└── stock-analysis/
    └── stock-analysis-2026-02-20-18:45:33.md
```

The folder name is derived from the spec filename (everything before `.spec.md`). The `history/` directory is gitignored by default.

---

## Project Structure

```
tug-pathaan/
├── pathaan.js          # Main CLI entry point
├── package.json
├── .gitignore
├── spec/               # Prompt definitions
│   ├── ai-news.spec.md
│   ├── demo.spec.md
│   └── stock-analysis.spec.md
└── history/            # Generated reports (gitignored)
    └── ...
```

---

## API Integration

Pathaan sends the raw Gemini output to the TTS notification API:

```bash
POST http://tugpi:3000/notify
Content-Type: application/json

{ "message": "<gemini response>" }
```

This triggers a text-to-speech announcement on the configured Google Home speaker via Home Assistant.

---

<p align="center">
  <sub>Built with ❤️ by The Ui Guy in Berlin.</sub>
</p>
