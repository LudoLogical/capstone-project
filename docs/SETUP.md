# Development Environment Setup

## Prerequisites

- Node.js version 24.*
- `pnpm` (optional, but recommended)

## Starting the development server

After cloning this repository:

1. Open a terminal and navigate to the project root.
2. Run `pnpm install` (or `npm install` if not using `pnpm`)
3. Run `pnpm run dev` (or `npm run dev` if not using `pnpm`)
4. Open a web browser and navigate to `localhost:3000` (or the address shown in the terminal output if port 3000 is already in use)

## Stopping the development server

Ensure that the terminal has focus, then press `Ctrl+C` (not `Cmd+C` - this command is the same on Windows, MacOS, and Linux).

Note: in some cases, failing to do this can cause the process responsible for running the development server to become orphaned. If this happens, you can either locate and `kill` that process from the terminal or simply restart your computer.

## AI integrations

The production version of Vibrant Grants will leverage the Gemini API to perform a variety of tasks using artificial intelligence. Three of those tasks are defined in `src/ai/tasks.ts`, which reads a Gemini API key from a `.env` file located in the root directory of this project. As such, when implementing or testing AI-powered features, you must also create such a file and supply the API key by following the format shown in `.env.example`.