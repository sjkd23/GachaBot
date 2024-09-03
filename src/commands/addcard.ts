import { ButtonStyle, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { generateUniqueCardID, insertCard } from "../dbFunctions";
import { checkRarity, checkURL, buildCardEmbed, createButton, createButtonRow } from "../utils";
import { Card, MAX_CARD_AUTHOR_LENGTH, MAX_CARD_DESCRIPTION_LENGTH, MAX_CARD_NAME_LENGTH, RARITIES } from "../constants/definitions";
import { buttonCollector } from "../collectors/buttonCollector";

const DEFAULT_AUTHOR = 'Base author';

export const AddCard = {
    info: new SlashCommandBuilder()
        .setName('addcard')
        .setDescription('Adds a card to the database')
        .addStringOption(option =>
            option.setName('card_name')
                .setDescription('Enter your new cards name (max 32 char)')
                .setMaxLength(MAX_CARD_NAME_LENGTH)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Enter your new cards description (max 128 char.)')
                .setMaxLength(MAX_CARD_DESCRIPTION_LENGTH)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('rarity')
                .setDescription('Choose the cards rarity. Leave blank to make it random!')
                .addChoices({name: 'random', value: 'random'})
                .addChoices(...RARITIES)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('image_url')
                .setDescription('Please enter the URL for your cards image')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('author')
                .setDescription('What author is this card a part of? (leave blank for base game cards)')
                .setMaxLength(MAX_CARD_AUTHOR_LENGTH)
                .setRequired(false)
        ),

    run: async (interaction: ChatInputCommandInteraction): Promise<void> => {

        const name = interaction.options.getString('card_name');
        const description = interaction.options.getString('description');
        const rarityGiven = interaction.options.getString('rarity');
        const url = interaction.options.getString('image_url');
        let author = interaction.options.getString('author') || DEFAULT_AUTHOR;

        await interaction.deferReply({ ephemeral: true });


        if (!name || !description || !rarityGiven || !url) {
            await interaction.followUp({ content: 'Missing required fields.', ephemeral: true });
            return;
        }

        const rarity = await checkRarity(rarityGiven);

        const isValid = await checkURL(url);

        if (!isValid) {
            await interaction.followUp('invalid URL provided. Please test your URL yourself to see if it goes to an image.');
            return;
        }

        const id = '';
        const card: Card = { id, name, description, rarity, url, author };

        const embed = await buildCardEmbed(card);

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
            console.error(`Error sending embed in channel: ${interaction.channel?.id}(embed: ${embed})`, e)
            return;
        }

        const buttonID = await buttonCollector(interaction);

        if (buttonID === 'button_accept') {

            try {
            const result = await insertCard(name, rarity, description, url, author);

            if (result) {
                await interaction.followUp({
                    content: `${interaction.user} Card successfully added to the game!`,
                    embeds: [embed]
                });
                console.log(`${interaction.user.id} has added card: Name: ${card.name} to the database`);
            }
        } catch(err) {
            console.log(`${interaction.user.id} failed to add card: Name: ${card.name}, Desc: ${card.description}, URL: ${card.url} `, err);
            await interaction.followUp({content: `Error adding card to database. Make sure it is a unique card. If issue persists, please contact a developer.`, ephemeral: true});
        }

        } else if (buttonID === 'button_deny') {
            await interaction.followUp({ content: `Card was not added to the game, please run the command again if you'd like to retry!`, ephemeral: true});
            return;
        } else {
            await interaction.followUp({content: `You did not respond in time.`, ephemeral: true})
            return;
        }
    }
};