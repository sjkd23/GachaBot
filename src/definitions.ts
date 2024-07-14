export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'divine';

export type Card = {
    name: string,
    description: string,
    rarity: Rarity,
    score: number,
    url: string,
    author: string
}