import { ModalSubmitInteraction } from "discord.js";

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'divine';

export type Card = {
    id: string,
    name: string,
    description: string,
    rarity: Rarity,
    url: string,
    author: string,
    series: Series
}

export type Player = {
    discord_id: string,
    username: string,
    wallet: number
}

export type Series = {
    id: string,
    name: string,
    description: string
}
export interface Item {
    id: number;
    name: string;
    description: string;
    type_id: number;
    game_id: number;
}

export interface PlayerItemInventory {
    item: Item;
    quantity: number;
}

export type Fish = {
    id: number,
    name: string,
    rarity: Rarity,
    value: number,
    url: string
}

export type PlayerFishInventory = {
    discord_id: string,
    fish_id: number,
    quantity: number
}


export const RARITIES = [
    { name: 'common' as Rarity, id: 1 },
    { name: 'uncommon' as Rarity, id: 2 },
    { name: 'rare' as Rarity, id: 3 },
    { name: 'legendary' as Rarity, id: 4 },
    { name: 'divine' as Rarity, id: 5 }
];

export const BAIT_RARITIES_MODIFIERS = [
    { name: 'common', modifier: 1},
    { name: 'uncommon', modifier: 1.25},
    { name: 'rare', modifier: 1.75},
    { name: 'legendary', modifier: 2.5},
    { name: 'divine', modifier: 4 }
]

export const POINT_REWARDS = [
    { name: 'Tiny Point Reward', value: 1, weight: 1 },
    { name: 'Small Point Reward', value: 10, weight: 43 },
    { name: 'Medium Point Reward', value: 25, weight: 30 },
    { name: 'Large Point Reward', value: 50, weight: 15 },
    { name: 'Huge Point Reward', value: 100, weight: 7 },
    { name: 'Insane Point Reward', value: 250, weight: 3 },
    { name: 'JACKPOT Point Reward', value: 500, weight: 1 }
];


export const MAX_CARD_NAME_LENGTH = 32;
export const MAX_CARD_DESCRIPTION_LENGTH = 128;
export const MAX_CARD_AUTHOR_LENGTH = 128;

export const DEFAULT_SERIES = 'Wanderer';

export const GAMES = [
    { name: 'gacha', id: 1 },
    { name: 'fishing', id: 2 }
];

export const ITEM_TYPES = [
    { name: 'equipment', id: 1 },
    { name: 'consumable', id: 2 }
]