import { SlashCommandBuilder, ChatInputCommandInteraction, ButtonBuilder, EmbedBuilder } from "discord.js";
import { Card, PlayerItemInventory } from "../constants/definitions";
import { getAllSeries, getPlayerCards, getPlayerItems, validPlayer } from "../dbFunctions";
import { createButtonRow, handleCardCycling, rarityCardSelect, seriesCardSelect, viewCardSelect } from "../utils/componentsUils";
import { cardInventoryEmbed, itemInventoryEmbed } from "../utils/embeds";
import { BUTTONS as b } from "../constants/componentConstants";
import { componentCollector } from "../collectors/componentCollectors";
import { getCardsByRarity, getCardsBySeries, isRarity } from "../utils/misc";
import { DM_NOT_ALLOWED_ERR, PLAYER_DOESNT_EXIST } from "../constants/errors";

export const Inventory = {
    info: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Check your current card and/or item inventory'),

    run: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.channel) {
            await interaction.reply({content: DM_NOT_ALLOWED_ERR, ephemeral: true});
            return;
        }

        if(!await validPlayer(interaction.user.id)) {
            await interaction.reply({content: PLAYER_DOESNT_EXIST, ephemeral: true});
            return;
        }
        
        await interaction.deferReply();

        const user = interaction.user;

        const cards: Card[] = await getPlayerCards(user.id);
        const items: PlayerItemInventory[] = await getPlayerItems(user.id);

        let state = 'initial_inventory';

        const inventoryEmbeds: EmbedBuilder[] = [];
        const buttons: ButtonBuilder[] = [];


        const series = await getAllSeries()

        const cardInvEmbed = await cardInventoryEmbed(user, cards);
        const itemInvEmbed = await itemInventoryEmbed(user, items);
        inventoryEmbeds.push(cardInvEmbed, itemInvEmbed);
        buttons.push(b.CARD_DETAILS_BUTTON, b.ITEM_DETAILS_BUTTON);

        const buttonRow = createButtonRow(buttons);

        const back = b.BACK_BUTTON;
        const cancel = b.CANCEL_BUTTON;

        const initialInventoryMsg =  {embeds: inventoryEmbeds, components: [buttonRow]};

        const cardDetailsMsg = {
            embeds: [cardInvEmbed],
            components: [
                { type: 1, components: [viewCardSelect()] }, // First row
                { type: 1, components: [back, cancel] } // Second row
            ]
        };

        const raritySelectMsg = {
            content: `Which rarity would you like to sort by?`,
            embeds: [],
            components: [
                { type: 1, components: [rarityCardSelect()] },
                { type: 1, components: [back, cancel] }
            ]
        };

        const seriesSelectMsg = {
            embeds: [],
            components: [
                { type: 1, components: [await seriesCardSelect()] },
                { type: 1, components: [back, cancel] }
            ]
        };

        await interaction.editReply(initialInventoryMsg);

        let c: string | null;
        let on = true;
        while (on) {
            c = await componentCollector(interaction);

            if (c === b.CARD_DETAILS_ID) {
                state = 'card_details';
                await interaction.editReply(cardDetailsMsg);
            }

            if (c === 'rarity') {
                state = 'rarity_select';
                await interaction.editReply(raritySelectMsg);
            }

            if (c === 'series') {
                state = 'series_select';
                await interaction.editReply(seriesSelectMsg);
            }

            if (isRarity(c)) {
                state = 'rarity_card_view';
                const sortedCards = await getCardsByRarity(cards, c);
                const getMsgContent = (currentCard: number, cardAmnt: number): string => {
                    return `You have ${sortedCards.length} ${c} cards! (${currentCard + 1}/${cardAmnt})`
                }
                const msg = await handleCardCycling(interaction, sortedCards, sortedCards.length, getMsgContent, true)
                if (msg) {
                    c = msg;
                }
            }

            for (let ser of series) {
                if (c === ser.name.toLowerCase()) {
                    state = 'series_card_view';
                    const sortedCards = await getCardsBySeries(cards, ser);

                    const getMsgContent = (currentCard: number, cardAmnt: number): string => {
                        return `You have ${sortedCards.length} cards in the ${ser.name} series! (${currentCard + 1}/${cardAmnt})`
                    }
                    const msg = await handleCardCycling(interaction, sortedCards, sortedCards.length, getMsgContent, true);
                    if (msg) {
                        c = msg;
                    }
                }
            }

            if (c === b.BACK_ID) {
                switch (state) {
                    case 'card_details':
                        await interaction.editReply(initialInventoryMsg);
                        state = 'initial_inventory';
                        break;
                    case 'item_details':
                        await interaction.editReply(initialInventoryMsg);
                        state = 'initial_inventory';
                        break;
                    case 'rarity_select':
                        await interaction.editReply(cardDetailsMsg);
                        state = 'card_details';
                        break;
                    case 'series_select':
                        await interaction.editReply(cardDetailsMsg);
                        state = 'card_details';
                        break;
                    case 'rarity_card_view':
                        await interaction.editReply(raritySelectMsg);
                        state = 'rarity_select';
                        break;
                    case 'series_card_view':
                        await interaction.editReply(seriesSelectMsg);
                        state = 'series_select';
                        break;
                }
            }

            if (c === null || c === b.CANCEL_ID) {
                await interaction.editReply({
                    content: 'This process has been canceled.',
                    components: []
                });
                return;
            }
        }
    }
};