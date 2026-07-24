# Project Structure

This codebase consists of a [Next.js](https://nextjs.org/docs) application that uses the [app router](https://nextjs.org/docs#app-router-and-pages-router), [TypeScript](https://www.typescriptlang.org/docs/), [Tailwind CSS](https://tailwindcss.com/docs/installation/using-postcss), and [Zustand](https://zustand.docs.pmnd.rs/learn/getting-started/introduction).

## Front-end code

The page routes themselves, as well as their helper components and helper code files, are located in `src/app`. Generic components can be found in `src/components`. Everything inside of both directories was generated through vibe coding, though most of the code has been manually reviewed.

State hydration and management are performed using Zustand; the relevant files were also vibe coded and can be found in `src/store`.

## Data and types

The heart of this project's data ecosystem is `src/types`, which contains completely hand-written type definitions for almost all of the information that is or will be necessary to hydrate the Next.js application front end. The only major exception is user auth, which has been omitted entirely from this prototype to maximize ease of adoption. Absolutely none of the content in `src/types` was written by or with assistance from artificial intelligence.

Due to the stand-alone nature of this prototype, Most NSR-specific data sources were not available during development. As such, `src/data` contains mock seed data for the application. These data were generated using artificial intelligence.

## Other files

The production version of Vibrant Grants will leverage the Gemini API to perform a variety of tasks using artificial intelligence. The system prompts (as markdown files), response schemas (as JSON files), and TypeScript invocations for three of those tasks can be found in `src/ai`. Absolutely none of the content in `src/ai` was written by or with assistance from artificial intelligence.

Finally, `src/utils` contains miscellaneous functions that are or can be reused throughout the codebase.