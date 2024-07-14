import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageActionRowComponentBuilder } from "discord.js";
import { Card, Rarity } from "./definitions";
import axios from 'axios';

export async function rarityToNumber(rarity: Rarity):Promise<number> {

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
        } else{
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
        .setAuthor({name: card.rarity})
        .setFooter({ text: `${card.author}`})

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