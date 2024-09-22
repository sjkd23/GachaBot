import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { DM_NOT_ALLOWED_ERR, PLAYER_DOESNT_EXIST } from '../constants/errors';
import { getItemByName, getPlayerItem, getAllPlayerItems, givePlayerFish, validPlayer, reduceItemQuantity } from '../dbFunctions';
import { fishEmbed, itemEmbed } from "../utils/embeds";
import { getBaitTypes, getRandomFish, getRandomRarity, randomIntFromInterval } from "../utils/misc";
import { componentCollector } from "../collectors/componentCollectors";
import { BUTTONS as b } from "../constants/componentConstants"
import { createButtonRow, itemPicker } from "../utils/componentsUils";
import { BAIT_RARITIES_MODIFIERS, Item, PlayerItemInventory } from "../constants/definitions";


export const Fish = async () => {

    const baitOptions = (await getBaitTypes()).map(bait => ({
        name: bait.name,
        value: bait.name
    }));

    return {
        info: new SlashCommandBuilder()
            .setName('fish')
            .setDescription('Go fishing!')
            .addStringOption(option =>
                option.setName('bait_type')
                    .setDescription('Which type of bait would you like to use? (Defaults to Common Bait)')
                    .addChoices(...baitOptions)
                    .setRequired(false)
            ),

        run: async (interaction: ChatInputCommandInteraction): Promise<void> => {
            if (!interaction.channel) {
                await interaction.reply({ content: DM_NOT_ALLOWED_ERR, ephemeral: true });
                return;
            }

            if (!await validPlayer(interaction.user.id)) {
                await interaction.reply({ content: PLAYER_DOESNT_EXIST, ephemeral: true });
                return;
            }

            await interaction.deferReply();
            const bait = interaction.options.getString('bait_type') ?? 'Common Bait';

            const baitItem = await getItemByName(bait);

            const usedBait = await getPlayerItem(interaction.user.id, baitItem);

            await interaction.editReply({
                content: 'Ready to start?',
                embeds: [],
                components: [createButtonRow([b.CAST_BUTTON, b.USE_ITEM_BUTTON])]
            });

            const buttonID = await componentCollector(interaction);

            let itemsUsed: PlayerItemInventory[] = [];
            if (buttonID === null) {
                await interaction.editReply({ content: 'You didn\'t respond in time', embeds: [], components: [] })
                return;
            } else if (buttonID === b.USE_ITEM_ID) {
                const itemPicker = await handleItemPicker(interaction)

                if (!itemPicker) {
                    return;
                } else {
                    itemsUsed = itemPicker;
                }
            }
            let on = true;
            let fishAgain = true;
            while (on) {
                if (itemsUsed.length > 0) {
                    fishAgain = await fishingGame(interaction, usedBait, itemsUsed);
                } else {
                    fishAgain = await fishingGame(interaction, usedBait);
                }
                if (!fishAgain) {
                    on = false;
                    return;
                } else {
                    continue;
                }
            }
        }
    }
}

async function handleItemPicker(interaction: ChatInputCommandInteraction): Promise<PlayerItemInventory[] | null> {
    let on = true;
    const confirmRow = createButtonRow([b.YES_BUTTON, b.BACK_BUTTON, b.CANCEL_BUTTON])
    let itemsUsed: PlayerItemInventory[] = [];
    while (on) {
        const playerItems = await getAllPlayerItems(interaction.user.id);

        const allowedItems = removeBaitItems(playerItems);

        itemsUsed = await itemPicker(interaction, allowedItems, 2);

        if (itemsUsed.length > 0) {

            const itemUsedEmbed = await itemEmbed(itemsUsed)

            await interaction.editReply({
                content: 'Are these the items you want to use?',
                embeds: [itemUsedEmbed],
                components: [confirmRow]
            })
            const buttonID = await componentCollector(interaction);

            if (buttonID === b.YES_ID) {
                on = false;
            } else if (buttonID === b.BACK_ID) {

            } else if (buttonID === b.CANCEL_ID) {
                await interaction.editReply({ content: 'Process canceled', components: [] });
                return null;
            } else if (buttonID === null) {
                await interaction.editReply({ content: 'Process timed out', components: [] });
                return null;
            }
        }
    }
    return itemsUsed
}

async function fishingGame(
    interaction: ChatInputCommandInteraction,
    baitType: PlayerItemInventory,
    playerItems?: PlayerItemInventory[]
): Promise<boolean> {

    const baitRemaining = await reduceItemQuantity(interaction.user.id, baitType.item);

    if (baitRemaining < 0) {
        await interaction.editReply({
            content: `You are out of **${baitType.item.name}**! Either buy more, or continue fishing with different bait!`,
            components: []
        });
        return false;
    }

    const row = createButtonRow([b.WAIT_BUTTON]);
    await interaction.editReply({
        content: `Get read to catch the fish!`,
        components: [row],
        embeds: []
    });

    const rollAgainRow = createButtonRow([b.FISH_AGAIN_BUTTON, b.CANCEL_BUTTON]);
    const rarity = getRandomRarity();

    const waitTime = getBaitTime(baitType.item);
    const waitingButtonID = await componentCollector(interaction, waitTime)

    if (waitingButtonID === b.WAIT_ID) {
        await interaction.editReply({ content: `Too soon! You scared it away! Try Again?`, components: [] });
    } else {

        const biteRow = createButtonRow([b.CATCH_BUTTON]);
        await interaction.editReply({ content: `NOW!`, components: [biteRow] });

        const biteTime = fishCatchTime(rarity.toString(), baitType.item);
        const buttonID = await componentCollector(interaction, biteTime);

        if (buttonID === b.CATCH_ID) {
            const fish = await getRandomFish();
            const embed = await fishEmbed(fish);

            const quantity = await givePlayerFish(interaction.user.id, fish.id);

            await interaction.editReply({
                content: `**CATCH!** You have ${quantity} of these now!`,
                embeds: [embed],
                components: []
            });

        } else if (buttonID === null) {
            await interaction.editReply({ content: `Dang, you missed it! Try again?`, embeds: [], components: [] });
        }
    }

    await interaction.editReply({ components: [rollAgainRow] });
    const continueID = await componentCollector(interaction);

    if (continueID === b.FISH_AGAIN_ID) {
        return true;
    } else if (continueID === b.CANCEL_ID) {
        await interaction.editReply({ components: [] });
        return false;
    } else if (continueID === null) {
        await interaction.editReply({ content: 'Interaction timed out' });
        return false;
    } else {
        return false;
    }
}

function removeBaitItems(items: PlayerItemInventory[]): PlayerItemInventory[] {
    const filteredItems: PlayerItemInventory[] = [];

    for (let item of items) {
        if (!item.item.name.toLowerCase().includes('bait')) {
            filteredItems.push(item);
        }
    }
    return filteredItems;
}

function getBaitTime(baitUsed: Item) {

    let min = 3000;
    let max = 5000;
    for (const bait of BAIT_RARITIES_MODIFIERS) {
        if (baitUsed.name.toLowerCase().includes(bait.name)) {
            min = min / bait.modifier;
            max = max / bait.modifier;
            const time = randomIntFromInterval(min, max)
            return time
        }
    }
}

function fishCatchTime(rarity: string, baitUsed: Item) {
    let min = 5000;
    let max = 7000;

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

    for (const bait of BAIT_RARITIES_MODIFIERS) {
        if (baitUsed.name.toLowerCase().includes(bait.name)) {
            min = min * bait.modifier;
            max = max * bait.modifier;
            return randomIntFromInterval(min, max);
        }
    }
    return randomIntFromInterval(min, max);
}