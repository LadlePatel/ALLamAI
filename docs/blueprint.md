# **App Name**: ALLamAI

## Core Features:

- ChatGPT-like Interface: Replicate the user-friendly and intuitive interface of ChatGPT for seamless conversations.
- Message History: Maintain message history to remember what was said in previous conversations. Stored only in local storage (client-side) for the MVP.
- Text Input Area: Provide a clear text input area for the user to compose and send messages.
- Display Messages: Display chat bubbles or containers that display user and bot messages separately.
- Light/Dark Mode: Implement a toggle for light and dark modes, to improve the viewing experience.
- Chatbot: LLM that uses a knowledge base and a semantic cache to generate responses to user prompts
- KB Manual Entry: Add an entry to the knowledge base for the LLM to draw from when answering user prompts.
- KB File Upload: Upload a file (TXT or PDF) as a knowledge base for the LLM to draw from when answering user prompts.
- User Session: Select a user session to retain context.

## Style Guidelines:

- Primary color: HSL(220, 60%, 50%) / Hex #4A90E2 - A calming and trustworthy blue to instill confidence.
- Background color: Dark Mode: HSL(220, 20%, 10%) / Hex #1A2633. Light Mode: HSL(220, 10%, 95%) / Hex #F2F8FF. A desaturated blue that provides contrast without being distracting.
- Accent color: HSL(280, 40%, 60%) / Hex #9F5BCD - An analogous purple used sparingly to highlight user interactions and key UI elements.
- Body text: 'Inter', sans-serif, for a modern, machined look that is legible on both light and dark backgrounds
- Headline text: 'Space Grotesk', sans-serif, for headlines and shorter body text
- Use simple, outlined icons from a library like Feather or Tabler Icons, ensuring they are easily visible in both light and dark modes.
- Design a clean and intuitive layout, resembling the ChatGPT interface, with a focus on readability and user experience. Use Tailwind's grid and flexbox utilities to achieve a responsive design.
- Incorporate subtle transitions and animations to enhance the user experience, such as message appearance or theme changes.