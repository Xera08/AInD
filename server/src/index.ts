import dotenv from 'dotenv';
import { randomInt } from 'node:crypto';
import path from 'node:path';
import cors from 'cors';
import express from 'express';
import { characterRules, startingEquipment, validateCharacter } from './character.js';
import { retrieveRules, rulesSource } from './rules.js';

dotenv.config({ path: path.join(process.env.INIT_CWD ?? process.cwd(), '.env') });

const app = express();
const port = Number(process.env.PORT ?? 3000);
const apiKey = process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY;
const model = process.env.AI_MODEL ?? process.env.OPENAI_MODEL ?? 'openai/gpt-oss-20b';
const baseUrl = process.env.AI_BASE_URL ?? process.env.OPENAI_BASE_URL ?? 'https://api.groq.com/openai/v1';

app.use(cors());
app.use(express.json());

const systemPrompt = `You are the Dungeon Master for a focused Dungeons & Dragons-inspired solo adventure. Stay in character as a vivid, concise narrator. Resolve the player's action fairly using reasonable tabletop rules: call for a check when uncertainty matters, invent a DC, and report the outcome. Never decide the player's actions for them. Keep responses to 2-4 paragraphs and end with a clear situation or question. The setting is Blackwater Fen, a rain-soaked gothic marsh. Do not claim to have access to tools or memories outside this conversation. Do not give clear action variants to players unless they directly ask for it. Describe the scene only from the character's point of view; do not reveal things they cannot see. Do not tell the possible outcomes of a roll or reveal the DC.`;

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'aind-dm-engine' });
});

app.get('/api/rules/search', (request, response) => {
  const query = typeof request.query.q === 'string' ? request.query.q : '';
  response.json({ source: rulesSource, context: retrieveRules(query) });
});

app.get('/api/characters/starting-equipment', (request, response) => {
  const className = typeof request.query.className === 'string' ? request.query.className : '';
  const race = typeof request.query.race === 'string' ? request.query.race : 'Human';
  response.json({ inventory: startingEquipment(className, race) });
});

app.post('/api/roll', (request, response) => {
  const { sides, modifier = 0 } = request.body as { sides?: number; modifier?: number };
  const validSides = [4, 6, 8, 10, 12, 20, 100];
  const parsedSides = Number(sides);
  const parsedModifier = Number(modifier);

  if (!validSides.includes(parsedSides) || !Number.isInteger(parsedModifier) || parsedModifier < -20 || parsedModifier > 20) {
    response.status(400).json({ error: 'Choose a standard die and a modifier between -20 and +20.' });
    return;
  }

  const roll = randomInt(1, parsedSides + 1);
  response.json({
    die: `d${parsedSides}`,
    roll,
    modifier: parsedModifier,
    total: roll + parsedModifier,
    notation: `d${parsedSides}${parsedModifier >= 0 ? `+${parsedModifier}` : parsedModifier}`,
  });
});

app.post('/api/chat', async (request, response) => {
  const { messages, characterName, characterClass } = request.body as {
    messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
    characterName?: string;
    characterClass?: string;
    character?: { name?: string; className?: string; race?: string; level?: number };
  };

  if (!apiKey) {
    response.status(503).json({ error: 'Add AI_API_KEY to .env to wake the DM.' });
    return;
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    response.status(400).json({ error: 'At least one message is required.' });
    return;
  }

  const character = validateCharacter(request.body.character ?? {
    name: characterName,
    className: characterClass,
    race: 'Human',
    level: 3,
  });
  if (!character) {
    response.status(400).json({ error: 'A valid character sheet is required before entering the adventure.' });
    return;
  }

  try {
    const latestPlayerAction = [...messages].reverse().find((message) => message.role === 'user')?.content ?? '';
    const rulesContext = retrieveRules(latestPlayerAction);
    const inventoryContext = `The character inventory is exactly: ${character.inventory.join(', ')}. If the action requires an item not listed, do not let it appear from nowhere. Say that the character does not have it and ask what they do with the equipment they actually carry.`;
    const modelResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        model,
        temperature: 0.9,
        max_tokens: 350,
        messages: [
          { role: 'system', content: `${systemPrompt}\n${characterRules(character)}\n${inventoryContext}\n\n${rulesSource}\nUse the following retrieved rules context when relevant. Treat it as the rules authority for this response. Do not mention the internal index unless the player asks about rules. If the context does not cover something, make a transparent, reasonable ruling rather than presenting an invented rule as exact:\n${rulesContext}` },
          ...messages.slice(-12),
        ],
      }),
    });
    const data = await modelResponse.json() as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };
    if (!modelResponse.ok) {
      response.status(502).json({ error: data.error?.message ?? 'The model provider rejected the request.' });
      return;
    }
    const message = data.choices?.[0]?.message?.content?.trim();
    response.json({ message: message || 'The DM pauses. Your action needs an item or ability that is not available to this character. What do you do with the equipment you actually carry?' });
  } catch (error) {
    console.error(error);
    response.status(502).json({ error: 'The DM is unreachable right now.' });
  }
});

app.post('/api/campaigns', (request, response) => {
  response.status(201).json({
    id: `demo-${Date.now()}`,
    ...request.body,
    createdAt: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`AInD server listening on http://localhost:${port}`);
});
