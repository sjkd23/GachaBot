import { ChatInputCommandInteraction, EmbedBuilder, HexColorString, User } from "discord.js";
import { Player, Card, PlayerItemInventory, Rarity, Fish } from "../constants/definitions";
import { countRarities, countSeries, getUserInfo } from "./misc";
import { THUMBNAILS } from "../constants/pictures";
import { getAllSeries } from "../dbFunctions";

export async function playerStatsEmbed(player: Player, cards: Card[], interaction: ChatInputCommandInteraction): Promise<EmbedBuilder> {

    let common = 0, uncommon = 0, rare = 0, legendary = 0, divine = 0;

    if (cards && cards.length > 0) {
        const count = countRarities(cards);
        common = count.common;
        uncommon = count.uncommon;
        rare = count.rare;
        legendary = count.legendary;
        divine = count.divine;
    }

    const rarityList = getRarityList(common, uncommon, rare, legendary, divine);

    const user = await getUserInfo(player.discord_id, interaction);
    const embed = new EmbedBuilder()
        .setTitle(`${player.username}'s profile`)
        .addFields(
            {
                name: ' ',
                value: `${rarityList}`, inline: true
            }, {name: ' ', value: `__**Wallet:**__ ${player.wallet}`, inline: true }
        )
        .setColor(getRandomColor())

    if (user) {
        const username = user.username;
        const avatar = user.displayAvatarURL({ size: 1024 });

        embed.setAuthor({ name: username, iconURL: avatar })
    }

    return embed
}

export async function cardInventoryEmbed(user: User, cards: Card[]): Promise<EmbedBuilder> {

    let common = 0, uncommon = 0, rare = 0, legendary = 0, divine = 0;

    if (cards && cards.length > 0) {
        const count = countRarities(cards);
        common = count.common;
        uncommon = count.uncommon;
        rare = count.rare;
        legendary = count.legendary;
        divine = count.divine;
    }

    const allSeries = await getAllSeries()

    const seriesCount = countSeries(cards, allSeries);

    const seriesList = getSeriesList(seriesCount)
    const rarityList = getRarityList(common, uncommon, rare, legendary, divine);

    const embed = new EmbedBuilder()
        .setTitle(`${cards.length} total cards`)
        .addFields(
            { name: ' ', value: rarityList, inline: true },
            { name: ' ', value: seriesList, inline: true})
        .setColor(getRandomColor())
        .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ size: 1024 }) });

    return embed
}

export async function itemInventoryEmbed(user: User, items: PlayerItemInventory[]): Promise<EmbedBuilder> {
    const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s item inventory:`)
        .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ size: 1024 }) })
        .setColor(getRandomColor())

    for (let i = 0; i < items.length; i++) {
        const item = items[i].item;
        embed.addFields({ name: item.name, value: item.description });
    }

    return embed;
}

export async function cardEmbed(card: Card): Promise<EmbedBuilder> {

    const rarityThumb = await getRarityThumb(card.rarity);

    const footer = `📝 ${card.author} | 📚 ${card.series.name}`;

    const embed = new EmbedBuilder()
        .setTitle(card.name)
        .addFields({ name: ' ', value: `*${card.description}*` })
        .setImage(card.url)
        .setFooter({ text: footer })
        .setColor(await getEmbedColor(card.rarity))
        .setThumbnail(rarityThumb)
    return embed;
}

export async function fishEmbed(fish: Fish): Promise<EmbedBuilder> {

    const embed = new EmbedBuilder()
        .addFields({ name: ' ', value: `You caught a ${fish.name}!\n\n **${fish.rarity.toUpperCase()}** fish!` })
        .setThumbnail(fish.url)
        .setColor(await getEmbedColor(fish.rarity))
    
    return embed;
}

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

export const getRarityList = (
    common: number, uncommon: number,
    rare: number, legendary: number,
    divine: number): string => {
    return `**__CARDS__**\n
            \`Common: ${common}\`\n
            \`Uncommon: ${uncommon}\`\n
            \`Rare: ${rare}\`\n
            \`Legendary: ${legendary}\`\n
            \`Divine: ${divine}\`\n`;
}

export const getSeriesList = (seriesCount: Record<string, number>): string => {
    let seriesList = `**__SERIES__**\n`;
    
    for (const [series, count] of Object.entries(seriesCount)) {
        seriesList += `\`${series}: ${count}\`\n`;
    }

    return seriesList;
};


