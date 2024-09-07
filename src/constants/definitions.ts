export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'divine';

export const RARITIES = [
    { name: 'common', value: 'common' },
    { name: 'uncommon', value: 'uncommon' },
    { name: 'rare', value: 'rare' },
    { name: 'legendary', value: 'legendary' },
    { name: 'divine', value: 'divine' }
];


export type Card = {
    id: string,
    name: string,
    description: string,
    rarity: Rarity,
    url: string,
    author: string,
    series: string
}

export const MAX_CARD_NAME_LENGTH = 32;
export const MAX_CARD_DESCRIPTION_LENGTH = 128;
export const MAX_CARD_AUTHOR_LENGTH = 128;
