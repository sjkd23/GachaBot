import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { insertCard } from "../dbFunctions";
import { rarityToNumber, isRarity } from "../utils";
import { Rarity } from "../definitions";

const MAX_CARD_NAME_LENGTH = 32;
const MAX_DESCRIPTION_LENGTH = 128;
const RARITIES = [
    { name: 'random', value: 'random'},
    { name: 'common', value: 'common' },
    { name: 'uncommon', value: 'uncommon' },
    { name: 'rare', value: 'rare' },
    { name: 'legendary', value: 'legendary' },
    { name: 'divine', value: 'divine' }
];

const DEFAULT_SERIES = 'Base series';

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
                .setMaxLength(MAX_DESCRIPTION_LENGTH)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('rarity')
                .setDescription('Choose the cards rarity. Leave blank to make it random!')
                .addChoices(RARITIES)
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('score_value')
                .setDescription('Enter the base score value for your new card')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('image_url')
                .setDescription('Please enter the URL for your cards image')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('series')
                .setDescription('What series is this card a part of? (leave blank for base game cards)')
                .setRequired(false)
        ),

    run: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        
        const name = interaction.options.getString('card_name');
        const description = interaction.options.getString('description');
        const rarity = interaction.options.getString('rarity');
        const score = interaction.options.getInteger('score_value');
        const url = interaction.options.getString('image_url');
        let series = interaction.options.getString('series') || DEFAULT_SERIES;

        if (!name || !description || !rarity || !score || !url) {
            await interaction.reply({ content: 'Missing required fields.', ephemeral: true });
            return;
        }

        if (!isRarity(rarity)) {
            await interaction.reply({ content: 'Invalid rarity provided.', ephemeral: true });
            return;
        }

        const rarityNumber = await rarityToNumber(rarity);

        await insertCard(name, score, rarityNumber, description, series, url);
    }
};