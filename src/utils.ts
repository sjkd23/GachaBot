import { Rarity } from "./definitions";


export async function rarityToNumber(rarity: Rarity):Promise<number> {
let rarityName: Rarity;

    if (rarity === 'random') {
        rarityName = getRandomRarity();
    } else {
        rarityName = rarity;
    }

    if (rarityName === 'common') {
        return 1;
    }
    if (rarityName === 'uncommon') {
        return 2;
    }
    if (rarityName === 'rare') {
        return 3;
    }
    if (rarityName === 'legendary') {
        return 4;
    } else {
        return 5;
    }
}

function getRandomRarity(): 'common' | 'uncommon' | 'rare' | 'legendary' | 'divine' {
    const random = Math.random();

    if (random < 0.539) {
        return 'common';
    } else if (random < 0.539 + 0.30) {
        return 'uncommon';
    } else if (random < 0.539 + 0.30 + 0.15) {
        return 'rare';
    } else if (random < 0.539 + 0.30 + 0.15 + 0.01) {
        return 'legendary';
    } else {
        return 'divine';
    }
}

export function isRarity(value: string): value is Rarity {
    return ['random', 'common', 'uncommon', 'rare', 'legendary', 'divine'].includes(value);
}
