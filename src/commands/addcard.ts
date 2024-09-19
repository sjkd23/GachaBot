import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { changeWallet, getAllSeries, getSeriesID, getUserRole, idToSeries, insertCard, validPlayer } from "../dbFunctions";
import { checkRarity, checkURL, isRarity } from "../utils/misc";
import { Card, DEFAULT_SERIES, MAX_CARD_DESCRIPTION_LENGTH, MAX_CARD_NAME_LENGTH } from "../constants/definitions";
import { componentCollector } from "../collectors/componentCollectors";
import { DM_NOT_ALLOWED_ERR, PLAYER_DOESNT_EXIST } from "../constants/errors";
import { createButtonRow, rarityCardSelect } from "../utils/componentsUils";
import { cardEmbed } from "../utils/embeds";
import { BUTTONS as b } from "../constants/componentConstants";
import { THUMBNAILS } from "../constants/pictures";

const ADD_CARD_PRICE = 500;
export const AddCard = async () => {
    const seriesOptions = (await getAllSeries()).map(series => ({
        name: series.name,
        value: series.name
    }));

    return {
        info: new SlashCommandBuilder()
            .setName('addcard')
            .setDescription('Adds a card to the database')
            .addStringOption(option =>
                option.setName('card_name')
                    .setDescription('Enter your new card\'s name (max 32 char)')
                    .setMaxLength(MAX_CARD_NAME_LENGTH)
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('description')
                    .setDescription('Enter your new card\'s description (max 128 char.)')
                    .setMaxLength(MAX_CARD_DESCRIPTION_LENGTH)
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('image_url')
                    .setDescription('Please enter the URL for your card\'s image')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('series')
                    .setDescription(`What series should this card be part of? (Defaults to "${DEFAULT_SERIES}")`)
                    .setRequired(false)
                    .addChoices(...seriesOptions)
            ),

        run: async (interaction: ChatInputCommandInteraction): Promise<void> => {
            if (!interaction.channel) {
                await interaction.reply({content: DM_NOT_ALLOWED_ERR, ephemeral: true});
                return;
            }

            if(!await validPlayer(interaction.user.id)) {
                await interaction.reply({content: PLAYER_DOESNT_EXIST, ephemeral: true});
                return;
            }
            await interaction.deferReply({ ephemeral: true });

            const userRole = await getUserRole(interaction.user.id);

            let rarityGiven = 'random';

            if (userRole === 'owner') {
                await interaction.editReply({
                    content: 'Which rarity would you like your card to be?',
                    components: [
                        { type: 1, components: [rarityCardSelect()] },
                        { type: 1, components: [b.RANDOM_BUTTON] }
                    ]
                });

                const c = await componentCollector(interaction);

                if (isRarity(c)) {
                    rarityGiven = c.toString();
                } else if (c === null) {
                    await interaction.editReply({ content: 'Interaction timed out', components: [] })
                } else {
                    rarityGiven;
                }
            }

            const options = interaction.options;

            const author = interaction.user.username;

            const name = options.getString('card_name');
            const description = options.getString('description');
            const url = options.getString('image_url');
            const selectedSeries = options.getString('series') || DEFAULT_SERIES;


            if (!name || !description || !rarityGiven || !url) {
                await interaction.followUp({ content: 'Missing required fields.', ephemeral: true });
                return;
            }

            const rarity = await checkRarity(rarityGiven);

            const isValid = await checkURL(url);

            if (!isValid) {
                await interaction.editReply('Invalid URL provided. Please test your URL yourself to see if it goes to an image.');
                return;
            }
            const seriesID = await getSeriesID(selectedSeries)
            const series = await idToSeries(seriesID);
            const id = '';
            const card: Card = { id, name, description, rarity, url, author, series };
            const embed = await cardEmbed(card);
            embed.setColor(`#000000`)
            .setThumbnail(THUMBNAILS.unkown);

            const row = createButtonRow([b.YES_BUTTON, b.CANCEL_BUTTON]);

            try {
                const embedMessage = await interaction.editReply({
                    content: 'Is this the card you\'d like to make?',
                    embeds: [embed],
                    components: [row]
                });
            } catch (e) {
                await interaction.followUp({ content: `Error sending embed`, ephemeral: true });
                console.error(`Error sending embed in channel: ${interaction.channel?.id}(embed: ${embed})`, e);
                return;
            }

            const buttonID = await componentCollector(interaction);
            if (buttonID === b.YES_ID) {
                try {
                    const result = await insertCard(name, rarity, description, url, author, series);

                    if (result) {

                        const canAfford = await changeWallet(interaction.user.id, -ADD_CARD_PRICE);

                        if (canAfford < 0) {
                            await interaction.editReply({
                                content: `You don't have enough points to add a card (**requires ${ADD_CARD_PRICE} points**, you only have **${canAfford + 500}**)`,
                                embeds: [],
                                components: []})
                            return;
                        }
                        await interaction.channel?.send({
                            content: `${interaction.user} Card successfully added to the game!`,
                            embeds: [embed]
                        });
                        console.log(`${interaction.user.id} has added card: Name: ${card.name} to the database`);
                    }
                } catch (err) {
                    console.log(`${interaction.user.id} failed to add card: Name: ${card.name}, Desc: ${card.description}, URL: ${card.url} `, err);
                    await interaction.followUp({ content: `Error adding card to database. Make sure it is a unique card. If issue persists, please contact a developer.`, ephemeral: true });
                }
            } else if (buttonID === b.CANCEL_ID) {
                await interaction.editReply({ content: `Card was not added to the game, please run the command again if you'd like to retry!`, components: [] });
                return;
            } else if (buttonID === null) {
                await interaction.followUp({ content: `You did not respond in time.`, ephemeral: true });
                return;
            }
        }
    };
};
