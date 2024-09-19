import { ChatInputCommandInteraction } from "discord.js";
import { Card, Fish, POINT_REWARDS, Rarity, Series } from "../constants/definitions";
import axios from 'axios';
import { checkCardList, checkFishByRarity } from "../dbFunctions";
import sharp from 'sharp';

export async function rarityToNumber(rarity: Rarity): Promise<number> {

    if (rarity === 'common') {
        return 1;
    }
    if (rarity === 'uncommon') {
        return 2;
    }
    if (rarity === 'rare') {
        return 3;
    }
    if (rarity === 'legendary') {
        return 4;
    } else {
        return 5;
    }
}

export function getRandomRarity(): Rarity {

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

export function isRarity(value: any): value is Rarity {
    const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'legendary', 'divine'];
    return rarities.includes(value);
}

export async function checkRarity(rarity: string): Promise<Rarity> {

    if (isRarity(rarity)) {
        return rarity;
    } else {
        return getRandomRarity();
    }
}

export async function checkURL(url: string): Promise<boolean> {
    try {
        new URL(url);
    } catch (e) {
        console.error(`Invalid URL: (${url})`, e);
        return false;
    }

    try {
        const response = await axios.head(url);

        const contentType = response.headers['content-type'];
        if (contentType && contentType.startsWith('image/')) {
            return true;
        } else {
            console.error(`URL does not point to an image (url: ${url}, contentType: ${contentType}`);
            return false;
        }
    } catch (e) {
        console.error(`Error fetching URL: ${url}`, e);
        return false;
    }
}

export function isValidCardID(id: string): boolean {
    return /^[A-Z]{2}\d{4}$/.test(id);
}

export async function numberToRarity(num: number): Promise<Rarity> {
    if (num === 1) {
        return 'common';
    }
    if (num === 2) {
        return 'uncommon';
    }
    if (num === 3) {
        return 'rare';
    }
    if (num === 4) {
        return 'legendary';
    }
    else {
        return 'divine';
    }
}

export async function getRandomCard(): Promise<Card> {

    const rarity = getRandomRarity();
    const cards = await checkCardList({ rarity: rarity });
    const card = randomIntFromInterval(0, cards.length - 1);

    return cards[card];
}

export async function getRandomFish(rarity?: Rarity): Promise<Fish> {
    if(!rarity) {
        rarity = getRandomRarity();
    }
    const fish = await checkFishByRarity(rarity);
    const random = randomIntFromInterval(0, fish.length - 1);

    return fish[random];
}

export function randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

async function getImageDimensions(imageUrl: string): Promise<{ width: number, height: number }> {
    try {
        // Fetch the image from the URL using axios
        const response = await axios({
            url: imageUrl,
            responseType: 'arraybuffer', // Get the response as a buffer for processing
        });

        // Use sharp to get image metadata, including dimensions
        const image = sharp(response.data);
        const metadata = await image.metadata();

        if (metadata.width && metadata.height) {
            return {
                width: metadata.width,
                height: metadata.height,
            };
        } else {
            throw new Error('Unable to retrieve image dimensions');
        }
    } catch (error) {
        console.error('Error fetching image dimensions:', error);
        throw error;
    }
}

export function countRarities(cards: Card[]): Record<Rarity, number> {

    const rarityCount: Record<Rarity, number> = {
        common: 0,
        uncommon: 0,
        rare: 0,
        legendary: 0,
        divine: 0
    };

    cards.forEach(card => {
        // Check if the rarity is valid before incrementing
        if (rarityCount[card.rarity] !== undefined) {
            rarityCount[card.rarity]++;
        } else {
            console.warn(`Unexpected rarity: ${card.rarity}`);
        }
    });

    return rarityCount;
}

export function countSeries(cards: Card[], series: Series[]): Record<string, number> {
    // Initialize the count object for each series with 0
    const seriesCount: Record<string, number> = {};

    // Initialize the seriesCount object based on the provided series array, using the series.id as the key
    series.forEach(ser => {
        seriesCount[ser.name] = 0;
    });

    // Count occurrences of each card's series
    cards.forEach(card => {
        if (seriesCount[card.series.name] !== undefined) {
            seriesCount[card.series.name]++;
        } else {
            console.warn(`Unexpected series: ${card.series.id}`);
        }
    });

    return seriesCount;
}

export async function getUserInfo(discord_id: string, interaction: ChatInputCommandInteraction) {
    try {
        // Fetch the user object by ID
        const user = await interaction.client.users.fetch(discord_id);
        return user;

    } catch (error) {
        console.error(`Failed to fetch user info for ID ${discord_id}:`, error);
        return null;
    }
}

export async function getCardsByRarity(cards: Card[], rarity: Rarity): Promise<Card[]> {

    const sortedCards: Card[] = [];
    for (let card of cards) {
        if (card.rarity === rarity) {
            sortedCards.push(card);
        }
    }

    return sortedCards;
}

export async function getCardsBySeries(cards: Card[], series: Series): Promise<Card[]> {

    const sortedCards: Card[] = [];
    for (let card of cards) {
        if (card.series.id === series.id) {
            sortedCards.push(card);
        }
    }
    return sortedCards;
}

export async function randomPointReward(): Promise<{ name: string; value: number }> {

    const totalWeight = POINT_REWARDS.reduce((sum, reward) => sum + reward.weight, 0);

    const random = Math.random() * totalWeight;

    let cumulativeWeight = 0;

    for (const reward of POINT_REWARDS) {
        cumulativeWeight += reward.weight;
        if (random < cumulativeWeight) {
            return reward;
        }
    }

    return POINT_REWARDS[POINT_REWARDS.length - 1];
}

export function parseTimestamp(timestampString: string): Date {
    return new Date(timestampString);
}

export function hasBeen24Hours(lastUsedTimestamp: Date): { expired: boolean; timeLeft?: number } {
    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - lastUsedTimestamp.getTime(); // in milliseconds
    const hours24 = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (timeDifference >= hours24) {
        return { expired: true };
    } else {
        const timeLeft = hours24 - timeDifference;
        return { expired: false, timeLeft };
    }
}

export function formatTimeLeft(timeLeftInMs: number): string {
    const totalSeconds = Math.floor(timeLeftInMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
  
    let timeString = '';
    if (hours > 0) timeString += `${hours}h `;
    if (minutes > 0) timeString += `${minutes}m `;
    timeString += `${seconds}s`;
  
    return timeString.trim();
  }

export async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function fishCatchTime(rarity: Rarity) {
    let min = 1000;
    let max = 3000;

    if (rarity === 'common') {
        min = 5000;
        max = 7000;
    } else if (rarity === 'uncommon') {
        min = 2500;
        max = 5000
    } else if (rarity === 'rare') {
        min = 1500;
        max = 2500;
    } else if (rarity === 'legendary') {
        min = 500;
        max = 1500;
    } else {
        min = 250;
        max = 500;
    }

    return randomIntFromInterval(min, max);
}