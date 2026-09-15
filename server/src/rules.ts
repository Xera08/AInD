type RuleEntry = {
  id: string;
  keywords: string[];
  summary: string;
};

// These are concise gameplay summaries for the MVP, not a reproduction of a paid rulebook.
const rules: RuleEntry[] = [
  {
    id: 'ability-checks',
    keywords: ['check', 'ability', 'skill', 'dc', 'investigate', 'perception', 'survival', 'stealth', 'persuade'],
    summary: 'For an uncertain task, roll d20 + the relevant ability modifier and compare the total to a Difficulty Class (DC). Higher DCs represent harder tasks. The DM should only call for a roll when the outcome is uncertain and meaningful.',
  },
  {
    id: 'advantage-disadvantage',
    keywords: ['advantage', 'disadvantage', 'help', 'cover', 'hidden', 'visibility'],
    summary: 'With advantage, roll two d20s and use the higher result. With disadvantage, roll two d20s and use the lower result. Multiple sources do not stack; having both advantage and disadvantage cancels them.',
  },
  {
    id: 'combat-turn',
    keywords: ['combat', 'fight', 'attack', 'turn', 'initiative', 'action', 'bonus action', 'reaction', 'movement'],
    summary: 'In combat, a creature takes a turn in initiative order. On its turn it can move up to its speed and usually has one action; it may also have a bonus action if a feature grants one, and one reaction between its turns. An attack roll is d20 + the appropriate attack modifier against the target AC.',
  },
  {
    id: 'damage-and-hp',
    keywords: ['damage', 'hit points', 'hp', 'healing', 'unconscious', 'knocked out'],
    summary: 'Damage reduces hit points. At 0 hit points, a creature falls unconscious and normally begins making death saving throws on its turns. Healing restores hit points but cannot raise them above the creature\'s maximum.',
  },
  {
    id: 'death-saves',
    keywords: ['death', 'saving throw', 'death save', 'unconscious', 'stabilize'],
    summary: 'A death saving throw is a d20 with no ability modifier. A result of 10 or higher is a success; below 10 is a failure. Three successes stabilize, three failures mean death, and a natural 20 restores 1 hit point while a natural 1 counts as two failures.',
  },
  {
    id: 'conditions',
    keywords: ['blinded', 'charmed', 'frightened', 'grappled', 'poisoned', 'prone', 'restrained', 'stunned', 'condition'],
    summary: 'Conditions change what a creature can do. Blinded prevents seeing and gives disadvantage on attacks while attacks against it have advantage; frightened prevents willingly moving closer to the fear source and gives disadvantage while it is visible; prone gives disadvantage on attacks and advantage to attacks within 5 feet, while standing costs movement.',
  },
  {
    id: 'spellcasting',
    keywords: ['spell', 'spell slot', 'cantrip', 'concentration', 'casting'],
    summary: 'A spell uses its listed casting time, range, components, and duration. A spellcaster can maintain concentration on only one concentration spell at a time; taking damage requires a Constitution saving throw with DC 10 or half the damage, whichever is higher.',
  },
];

function normalize(value: string): string[] {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((word) => word.length > 2);
}

export function retrieveRules(query: string, limit = 3): string {
  const words = new Set(normalize(query));
  const ranked = rules
    .map((rule) => ({ rule, score: rule.keywords.reduce((score, keyword) => score + (words.has(keyword) ? 1 : 0), 0) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);

  if (ranked.length === 0) return 'No specific indexed rule matched this action. Use the broad principles of fair adjudication and state uncertainty clearly.';
  return ranked.map(({ rule }) => `[${rule.id}] ${rule.summary}`).join('\n');
}

export const rulesSource = 'AInD MVP rules index: concise summaries based on the official D&D System Reference Document (SRD).';
