import { ButtonStyle, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getAllSeries, insertCard } from "../dbFunctions";
import { checkRarity, checkURL, cardEmbed, createButton, createButtonRow } from "../utils/misc";
import { Card, MAX_CARD_DESCRIPTION_LENGTH, MAX_CARD_NAME_LENGTH, RARITIES } from "../constants/definitions";
import { buttonCollector } from "../collectors/buttonCollector";
import { DM_NOT_ALLOWED_ERR } from "../constants/errors";

export const AddCard = async () => {
    const seriesOptions = (await getAllSeries()).map(series => ({
        name: series,
        value: series
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
                option.setName('rarity')
                    .setDescription('Choose the card\'s rarity. Leave blank to make it random!')
                    .addChoices({ name: 'random', value: 'random' })
                    .addChoices(...RARITIES)
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('image_url')
                    .setDescription('Please enter the URL for your card\'s image')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('series')
                    .setDescription('What series should this card be part of? (Defaults to "Wanderer")')
                    .setRequired(false)
                    .addChoices(...seriesOptions)
            ),

        run: async (interaction: ChatInputCommandInteraction): Promise<void> => {
            if (!interaction.channel) {
                await interaction.reply(DM_NOT_ALLOWED_ERR);
                return;
            }
            const options = interaction.options;

            const author = interaction.user.username;

            const name = options.getString('card_name');
            const description = options.getString('description');
            const rarityGiven = options.getString('rarity');
            const url = options.getString('image_url');
            const series = options.getString('series') || 'Wanderer';

            await interaction.deferReply({ ephemeral: true });

            if (!name || !description || !rarityGiven || !url) {
                await interaction.followUp({ content: 'Missing required fields.', ephemeral: true });
                return;
            }

            const rarity = await checkRarity(rarityGiven);

            const isValid = await checkURL(url);

            if (!isValid) {
                await interaction.followUp('Invalid URL provided. Please test your URL yourself to see if it goes to an image.');
                return;
            }

            const id = ''; // Generate or set the card ID here
            const card: Card = { id, name, description, rarity, url, author, series };

            const embed = await cardEmbed(card);

            const accept = createButton('Accept', 'button_accept', ButtonStyle.Success);
            const deny = createButton('Deny', 'button_deny', ButtonStyle.Danger);

            const row = createButtonRow([accept, deny]);

            try {
                const embedMessage = await interaction.followUp({
                    content: 'Is this the card you\'d like to make?',
                    embeds: [embed],
                    components: [row]
                });
            } catch (e) {
                await interaction.followUp({ content: `Error sending embed`, ephemeral: true });
                console.error(`Error sending embed in channel: ${interaction.channel?.id}(embed: ${embed})`, e);
                return;
            }

            const buttonID = await buttonCollector(interaction);

            if (buttonID === 'button_accept') {
                try {
                    const result = await insertCard(name, rarity, description, url, author, series);

                    if (result) {
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
            } else if (buttonID === 'button_deny') {
                await interaction.followUp({ content: `Card was not added to the game, please run the command again if you'd like to retry!`, ephemeral: true });
                return;
            } else {
                await interaction.followUp({ content: `You did not respond in time.`, ephemeral: true });
                return;
            }
        }
    };
};
