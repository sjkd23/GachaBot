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
    name: string;
    description: string;
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
    { name: 'common', value: 'common' },
    { name: 'uncommon', value: 'uncommon' },
    { name: 'rare', value: 'rare' },
    { name: 'legendary', value: 'legendary' },
    { name: 'divine', value: 'divine' }
];

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