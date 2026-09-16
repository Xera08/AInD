export const classes = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk',
  'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard',
] as const;

export const races = [
  'Human', 'Elf', 'Dwarf', 'Halfling', 'Gnome', 'Half-Elf', 'Half-Orc', 'Tiefling', 'Dragonborn',
] as const;

export type CharacterInput = {
  name?: string;
  className?: string;
  race?: string;
  level?: number;
};

const classEquipment: Record<string, string[]> = {
  Barbarian: ['greataxe', 'two handaxes', 'explorer\'s pack', 'four javelins'],
  Bard: ['rapier', 'leather armor', 'dagger', 'entertainer\'s pack', 'musical instrument'],
  Cleric: ['mace', 'scale mail', 'light crossbow', 'bolt case', 'priest\'s pack', 'holy symbol'],
  Druid: ['wooden shield', 'scimitar', 'leather armor', 'explorer\'s pack', 'druidic focus'],
  Fighter: ['chain mail', 'shield', 'longsword', 'light crossbow', 'bolts', 'dungeoneer\'s pack'],
  Monk: ['shortsword', 'dungeoneer\'s pack', '10 darts'],
  Paladin: ['chain mail', 'shield', 'longsword', 'javelins', 'priest\'s pack', 'holy symbol'],
  Ranger: ['scale mail', 'two shortswords', 'longbow', 'quiver of arrows', 'explorer\'s pack'],
  Rogue: ['rapier', 'shortbow', 'quiver of arrows', 'leather armor', 'burglar\'s pack', 'two daggers', 'thieves\' tools'],
  Sorcerer: ['light crossbow', 'bolts', 'component pouch', 'dungeoneer\'s pack', 'two daggers'],
  Warlock: ['leather armor', 'light crossbow', 'bolts', 'component pouch', 'scholar\'s pack', 'dagger'],
  Wizard: ['quarterstaff', 'component pouch', 'scholar\'s pack', 'spellbook', 'dagger'],
};

export function startingEquipment(className: string, race: string): string[] {
  const racialItem = race === 'Dwarf' ? 'artisan\'s tools' : race === 'Elf' ? 'elven travel cloak' : race === 'Halfling' ? 'lucky token' : 'travel clothes';
  return [...(classEquipment[className] ?? []), racialItem, 'waterskin', '10 gp'];
}

const classRules: Record<string, string> = {
  Barbarian: 'Martial front-line class. Rage and weapon attacks are available; no spellcasting unless a future subclass explicitly grants it.',
  Bard: 'Full spellcaster and skill-focused class. May cast Bard spells using available slots and known spells.',
  Cleric: 'Full divine spellcaster. May prepare and cast Cleric spells appropriate to level and domain.',
  Druid: 'Full primal spellcaster. May prepare and cast Druid spells appropriate to level; wild shape is limited by level.',
  Fighter: 'Martial class. Weapon attacks, armor, Action Surge, and subclass features are available; no spellcasting unless a future subclass explicitly grants it.',
  Monk: 'Martial class. Unarmed strikes, Ki/discipline features, and monk weapons are available; no spellcasting.',
  Paladin: 'Martial half-caster. Weapon attacks, Lay on Hands, Divine Smite, and Paladin spells are available only at the level rules permit.',
  Ranger: 'Martial half-caster. Bows, martial weapons, exploration, and Ranger features are available. At level 2+, only known/prepared Ranger spells may be cast; never invent Wizard, Sorcerer, or arbitrary high-level spells.',
  Rogue: 'Martial skill class. Sneak Attack, Cunning Action, skills, and weapon attacks are available; no spellcasting unless a future subclass explicitly grants it.',
  Sorcerer: 'Full arcane spellcaster. May cast known Sorcerer spells using available slots.',
  Warlock: 'Pact-magic spellcaster. May cast known Warlock spells using available pact slots and class features.',
  Wizard: 'Full arcane spellcaster. May prepare and cast Wizard spells appropriate to level and spellbook.',
};

export function validateCharacter(input: CharacterInput): { name: string; className: string; race: string; level: number; inventory: string[] } | null {
  const name = typeof input.name === 'string' ? input.name.trim().slice(0, 40) : '';
  const className = typeof input.className === 'string' ? input.className : '';
  const race = typeof input.race === 'string' ? input.race : '';
  const level = Number(input.level);
  if (!name || !classes.includes(className as typeof classes[number]) || !races.includes(race as typeof races[number]) || !Number.isInteger(level) || level < 1 || level > 20) return null;
  return { name, className, race, level, inventory: startingEquipment(className, race) };
}

export function characterRules(character: { name: string; className: string; race: string; level: number; inventory: string[] }): string {
  const classRule = classRules[character.className] ?? 'Use only explicitly granted features.';
  return `CHARACTER RULES (SRD 5e): ${character.name} is a level ${character.level} ${character.race} ${character.className}. ${classRule} Starting inventory: ${character.inventory.join(', ')}. Inventory is authoritative when the player explicitly says they use, draw, equip, consume, throw, give, or already possess a named item. Do not create a missing item just because the player names it. Searching, investigating, looking around, or asking what is present is allowed and may reveal an item in the scene; it is not an inventory violation. Enforce level-gated features and spell access. If an action is unavailable, explain the fiction naturally and ask what they do instead. Never silently grant a class feature or item.`;
}
