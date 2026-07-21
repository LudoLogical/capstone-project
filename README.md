# Vibrant Grants

Find and win the perfect grant opportunity.

## Getting started

### Prerequisites

- Node.js (latest LTS version)
- Access to a Gemini API Key
- `pnpm` (optional, but recommended)

### Setup

1. Open a terminal and navigate to the project root.
2. Run `pnpm install` (or `npm install` if not using `pnpm`)
3. Run `pnpm run dev` (or `npm run dev` if not using `pnpm`)
4. Open a web browser and navigate to `localhost:3000` (or the address shown in the terminal output if port 3000 is already in use)

### Termination

Ensure that the terminal has focus, then press `Ctrl+C` (the command is the same on Windows, MacOS, and Linux).

## Project structure

- `/src/ai` contains carefully engineered AI invocation endpoints.
- `/src/app` contains the pages of the Next.js web application, as well as their helper components and helper code files.
- `/src/components` contains generic components that are or can be reused throughout the Next.js web application.
- `/src/data` contains mock seed data for the application.
- `/src/store` contains derived types, the Zustand store, and hydration code.
- `/src/types` contains the carefully engineered type definitions for the application.
- `/src/utils` contains non-React code files that are or can be reused throughout the application.

## Attribution

This project was developed as a collaboration between New Sun Rising and Master of Human-Computer Interaction students from Carnegie Mellon University.