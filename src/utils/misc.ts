import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, HexColorString, MessageActionRowComponentBuilder } from "discord.js";
import { Card, Rarity } from "../constants/definitions";
import axios from 'axios';
import { checkCardList } from "../dbFunctions";
import sharp from 'sharp';
import { THUMBNAILS } from "../constants/pictures";

export async function buildCardEmbed(card: Card): Promise<EmbedBuilder> {

    const rarityThumb = await getRarityThumb(card.rarity);

    const footer = `📝 ${card.author} | 📚 ${card.series}`;

    const embed = new EmbedBuilder()
        .setTitle(card.name)
        //.setDescription()
        .addFields({name: ' ', value: `*${card.description}*`})
        .setImage(card.url)
        .setFooter({ text: footer })
        .setColor(await getEmbedColor(card.rarity))
        .setThumbnail(rarityThumb)
    return embed;
}

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
        color = `#bbbebb`; //grey
    } else if (rarity === 'uncommon') {
        color = `#b3ecd1`; //green
    } else if (rarity === 'rare') {
        color = `#ffa6c5`; //pink
    } else if (rarity === 'legendary') {
        color = `#f48830`;// orange gold
    } else {
        color = `#000000` //divine - tbd
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

async function getRarityThumb(rarity: Rarity): Promise<string> {
    if (rarity === 'common') {
        return THUMBNAILS.common;

    } else if (rarity === 'uncommon') {
        return THUMBNAILS.uncommon;

    } else if (rarity === 'rare') {
        return THUMBNAILS.rare;

    } else if (rarity === 'legendary') {
        return THUMBNAILS.legendary;

    } else {
        return '';
    }
}

