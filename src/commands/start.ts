import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { DM_NOT_ALLOWED_ERR } from "../constants/errors";
import { insertPlayer, validPlayer } from "../dbFunctions";

export const Start = {
    info: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Run this command to setup your profile and start playing!'),


    run: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.channel) {
            await interaction.reply({ content: DM_NOT_ALLOWED_ERR, ephemeral: true });
            return;
        }

        if (await validPlayer(interaction.user.id)) {
            await interaction.reply('You are already setup to play!');
            return;
        }
        await insertPlayer(interaction.user.id, interaction.user.username)

        await interaction.reply('You have been added to the database, enjoy the game!');
        return;
    }
}