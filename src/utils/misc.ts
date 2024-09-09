import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, HexColorString, MessageActionRowComponentBuilder } from "discord.js";
import { Card, Player, Rarity } from "../constants/definitions";
import axios from 'axios';
import { checkCardList } from "../dbFunctions";
import sharp from 'sharp';
import { THUMBNAILS } from "../constants/pictures";


export async function playerStatsEmbed(player: Player, cards: Card[], interaction: ChatInputCommandInteraction): Promise<EmbedBuilder> {

    let common, uncommon, rare, legendary, divine = 0;

    if (cards && cards.length > 0) {
        const count = countRarities(cards);
        common = count.common;
        uncommon = count.uncommon;
        rare = count.rare;
        legendary = count.legendary;
        divine = count.divine;
    }

    const user = await getUserInfo(player.discord_id, interaction);

    const color = getRandomColor();

    const embed = new EmbedBuilder()
        .setTitle(`${player.username}'s profile`)
        .addFields(
            {name: ' ', 
            value:
            `**__CARDS__**
            \`Common: ${common}\`\n
            \`Uncommon: ${uncommon}\`\n
            \`Rare: ${rare}\`\n
            \`Legendary: ${legendary}\`\n
            \`Divine: ${divine}\`\n
            __**Wallet:**__ ${player.wallet}
            `, inline: true}
        )
        .setColor(color)
        
        if(user) {
            const username = user.username;
            const avatar = user.displayAvatarURL({size: 1024 });

        embed.setAuthor({name: username, iconURL: avatar})
        }
        if (cards && cards.length > 0 && cards[0].url) {
                embed.setThumbnail(cards[0].url);
        }

    return embed
}

export async function cardEmbed(card: Card): Promise<EmbedBuilder> {

    const rarityThumb = await getRarityThumb(card.rarity);

    const footer = `📝 ${card.author} | 📚 ${card.series}`;

    const embed = new EmbedBuilder()
        .setTitle(card.name)
        .addFields({ name: ' ', value: `*${card.description}*` })
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
    const card = randomIntFromInterval(1, cards.length - 1);

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


// Function to get a random color in hex code format
function getRandomColor(): number {
    const colors = [
        0x3498db, // Blue
        0x2ecc71, // Green
        0xf1c40f, // Yellow
        0xe74c3c, // Red
        0xe91e63  // Pink
    ];

    // Get a random color from the list
    return colors[Math.floor(Math.random() * colors.length)];
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