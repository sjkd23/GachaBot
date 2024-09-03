import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, HexColorString, MessageActionRowComponentBuilder } from "discord.js";
import { Card, Rarity } from "./constants/definitions";
import axios from 'axios';
import { checkCardList, getAllCards } from "./dbFunctions";

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

function getRandomRarity(): Rarity {

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

function isRarity(value: any): value is Rarity {
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

export async function buildCardEmbed(card: Card): Promise<EmbedBuilder> {
    
    const embed = new EmbedBuilder()
        .setTitle(card.name)
        .setDescription(card.description)
        .setImage(card.url)
        .setAuthor({ name: card.rarity })
        .setFooter({ text: `${card.author}` })
        .setColor(await getEmbedColor(card.rarity))

    return embed;
}

export function createButton(label: string, customId: string, style: ButtonStyle = ButtonStyle.Primary, disabled: boolean = false): ButtonBuilder {
    return new ButtonBuilder()
        .setLabel(label)
        .setCustomId(customId)
        .setStyle(style)
        .setDisabled(disabled);
}

export function createButtonRow(buttons: ButtonBuilder[]): ActionRowBuilder<MessageActionRowComponentBuilder> {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons);
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

async function getEmbedColor(rarity: Rarity): Promise<HexColorString> {
    let color: HexColorString;
    if (rarity === 'common') {
        color = `#808080`; //grey
    } else if (rarity === 'uncommon') {
        color = `#00A36C`; //green
    } else if (rarity === 'rare') {
        color = `#FF69B4`; //pink
    } else if (rarity === 'legendary') {
        color = `#D4A017`;// orange gold
    } else {
        color = `#000000` //black (shouldnt show up)
    }
    return color;
};

export async function getRandomCard(): Promise<Card> {

    const rarity = getRandomRarity();
    const cards = await checkCardList({ rarity: rarity });
    const card = randomIntFromInterval(1, cards.length);

    return cards[card];

}


function randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}