"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCard = void 0;
const discord_js_1 = require("discord.js");
const dbFunctions_1 = require("../dbFunctions");
const utils_1 = require("../utils");
const MAX_CARD_NAME_LENGTH = 32;
const MAX_DESCRIPTION_LENGTH = 128;
const RARITIES = [
    { name: 'random', value: 'random' },
    { name: 'common', value: 'common' },
    { name: 'uncommon', value: 'uncommon' },
    { name: 'rare', value: 'rare' },
    { name: 'legendary', value: 'legendary' },
    { name: 'divine', value: 'divine' }
];
const DEFAULT_SERIES = 'Base series';
exports.AddCard = {
    info: new discord_js_1.SlashCommandBuilder()
        .setName('addcard')
        .setDescription('Adds a card to the database')
        .addStringOption(option => option.setName('card_name')
        .setDescription('Enter your new cards name (max 32 char)')
        .setMaxLength(MAX_CARD_NAME_LENGTH)
        .setRequired(true))
        .addStringOption(option => option.setName('description')
        .setDescription('Enter your new cards description (max 128 char.)')
        .setMaxLength(MAX_DESCRIPTION_LENGTH)
        .setRequired(true))
        .addStringOption(option => option.setName('rarity')
        .setDescription('Choose the cards rarity. Leave blank to make it random!')
        .addChoices(RARITIES)
        .setRequired(true))
        .addIntegerOption(option => option.setName('score_value')
        .setDescription('Enter the base score value for your new card')
        .setRequired(true))
        .addStringOption(option => option.setName('image_url')
        .setDescription('Please enter the URL for your cards image')
        .setRequired(true))
        .addStringOption(option => option.setName('series')
        .setDescription('What series is this card a part of? (leave blank for base game cards)')
        .setRequired(false)),
    run: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        const name = interaction.options.getString('card_name');
        const description = interaction.options.getString('description');
        const rarity = interaction.options.getString('rarity');
        const score = interaction.options.getInteger('score_value');
        const url = interaction.options.getString('image_url');
        let series = interaction.options.getString('series') || DEFAULT_SERIES;
        if (!name || !description || !rarity || !score || !url) {
            yield interaction.reply({ content: 'Missing required fields.', ephemeral: true });
            return;
        }
        if (!(0, utils_1.isRarity)(rarity)) {
            yield interaction.reply({ content: 'Invalid rarity provided.', ephemeral: true });
            return;
        }
        const rarityNumber = yield (0, utils_1.rarityToNumber)(rarity);
        yield (0, dbFunctions_1.insertCard)(name, score, rarityNumber, description, series, url);
    })
};
