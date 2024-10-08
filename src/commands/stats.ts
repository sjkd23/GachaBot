import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { DM_NOT_ALLOWED_ERR, PLAYER_DOESNT_EXIST } from "../constants/errors";
import { getPlayer, getPlayerCards, validPlayer } from "../dbFunctions";
import { playerStatsEmbed } from "../utils/embeds";

export const Stats = {
    info: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Check a users stats; includes balance, number of cards at each rarity, and total number of cards!')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The target user. Leave blank to view your own')
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
        const id = interaction.user.id;

        const player = await getPlayer(id);
        const cards = await getPlayerCards(id)
        const embed = await playerStatsEmbed(player, cards, interaction);

        await interaction.reply({ content: `${interaction.user}`, embeds: [embed] });
        return;
    }
}