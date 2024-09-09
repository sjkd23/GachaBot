import { ButtonBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { MAX_CARD_NAME_LENGTH, MAX_CARD_AUTHOR_LENGTH, Rarity, Card } from "../constants/definitions";
import { RARITIES } from "../constants/definitions";
import { checkCardList, getAllSeries } from "../dbFunctions";
import { DM_NOT_ALLOWED_ERR } from "../constants/errors";
import { handleCardCycling } from "../utils/components";

export const ViewCards = async () => {
    const seriesOptions = (await getAllSeries()).map(series => ({
        name: series,
        value: series
    }));

    return {
        info: new SlashCommandBuilder()
            .setName('viewcards')
            .setDescription('Look at all cards in the database, can sort between name, rarity, author and/or URL')
            .addStringOption(option =>
                option.setName('name')
                    .setDescription('The name of the card you are looking for (not case sensitive)')
                    .setMaxLength(MAX_CARD_NAME_LENGTH)
                    .setRequired(false)
            )
            .addStringOption(option =>
                option.setName('rarity')
                    .setDescription('The rarity you want to view')
                    .addChoices(...RARITIES)
                    .setRequired(false)
            )
            .addStringOption(option =>
                option.setName('url')
                    .setDescription('The URL you are looking for. The same picture from a different URL does NOT work.')
            )
            .addStringOption(option =>
                option.setName('author')
                    .setDescription('The name of the author you want to search for (usually their discord tag)')
                    .setMaxLength(MAX_CARD_AUTHOR_LENGTH)
                    .setRequired(false)
            )
            .addStringOption(option =>
                option.setName('series')
                    .setDescription('Sort by series')
                    .addChoices(...seriesOptions)
                    .setRequired(false)
            ),

        run: async (interaction: ChatInputCommandInteraction): Promise<void> => {
            if (!interaction.channel) {
                await interaction.reply(DM_NOT_ALLOWED_ERR);
                return;
            }

            await interaction.deferReply();

            const options = interaction.options;

            const name = options.getString('name');
            const rarity = options.getString('rarity');
            const url = options.getString('url');
            const author = options.getString('author');
            const series = options.getString('series');

            const cards: Card[] = await checkCardList({
                name: name || undefined,
                rarity: rarity as Rarity || undefined,
                url: url || undefined,
                author: author || undefined,
                series: series || undefined
            });

            if (!cards || cards.length === 0) {
                await interaction.editReply(`No cards were found with the given specifications.`);
                return
            }

            const cardAmnt = cards.length;

            const getMsgContent = (currentCard: number, cardAmnt: number): string => {
                return `Found ${cardAmnt} cards ! (${currentCard + 1} / ${cardAmnt})`;
            };

            await handleCardCycling(interaction, cards, cardAmnt, getMsgContent);

        }
    }
}