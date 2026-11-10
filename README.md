# 1MS25IS002_assignment1 — ResearchMate

A Gemini-powered academic research-paper assistant built with React, TypeScript and Vite for Assignment 1.

## Features
- Accepts a research topic, academic level and optional scope.
- Uses a few-shot research-agent prompt to generate a structured paper draft.
- Uses Gemini API and requests machine-readable JSON output.
- Displays abstract, research questions, literature review, methodology, findings, limitations, conclusion and references.
- Exports results as JSON and readable TXT files.
- Includes loading/error states and an example topic.

## Setup
1. Install Node.js 20 or newer.
2. Clone this repository and run `npm install`.
3. Copy `.env.example` to `.env`.
4. Get an API key from https://aistudio.google.com/app/apikey.
5. Add `VITE_GEMINI_API_KEY=your_key` to `.env`.
6. Run `npm run dev`.
7. Run `npm run build` to verify the production build.

## Security
This is a student demo. Vite `VITE_` variables are exposed in the browser bundle. Do not use a production or personal key in a public deployment. For production, move API calls to a backend and store the key server-side.

## Research integrity
The agent is instructed not to fabricate citations or experimental findings. Verify all claims and references before academic submission.
