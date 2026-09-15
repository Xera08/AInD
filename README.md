# AInD

AInD is a full-stack foundation for an AI Dungeon Master experience. Players shape a character and campaign, then enter a narrative session where an AI DM can resolve actions with rules, rolls, and persistent state.

## Run locally

```bash
npm install
copy .env.example .env
npm run db:generate
npm run db:push
npm run dev
```

The client runs on `http://localhost:5173` and the API on `http://localhost:3000`.

## Enable the AI DM

For a free developer tier, create a Groq API key and put it in `.env`:

```env
AI_API_KEY="your-groq-key"
AI_MODEL="openai/gpt-oss-20b"
AI_BASE_URL="https://api.groq.com/openai/v1"
```

Restart `npm run dev`, open the client, and send an action. The browser sends the conversation to Express; Express adds the DM rules and calls the model. The API key is never exposed to React. Any OpenAI-compatible provider can be used by changing the three `AI_*` values. Existing `OPENAI_*` variables are still supported as a fallback.

## Rules source

The MVP uses a small server-side retrieval index of concise gameplay summaries based on the official D&D System Reference Document (SRD). Each chat request matches the latest player action to relevant rules and injects only those summaries into the DM prompt. This keeps the paid rulebooks out of the repository and avoids presenting unsupported text as authoritative.

The indexed context can also be inspected with `GET /api/rules/search?q=advantage+combat`. For broader coverage, expand `server/src/rules.ts` with rules from a properly licensed SRD source, or provide your own licensed rules dataset.

## Character creation

The client now starts with a creation screen for name, class, race, and starting level. Once the adventure begins, the sheet is locked; only the level-up control can change the character. The server validates the sheet and sends class, race, and level capabilities to the DM on every request. For example, a level 3 Ranger can use Ranger features and level-appropriate Ranger spells, but cannot cast an arbitrary Wizard spell such as Meteor Shower.
