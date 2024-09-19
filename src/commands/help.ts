import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { DM_NOT_ALLOWED_ERR } from "../constants/errors";

export const Help = {
    info: new SlashCommandBuilder()
        .setName('help')
        .setDescription('The go-to command if you\'re confused!'),

    run: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.channel) {
            await interaction.reply({ content: DM_NOT_ALLOWED_ERR, ephemeral: true });
            return;
        }

        const embed = new EmbedBuilder();
        embed.setTitle('Help Pannel')
            .setDescription('** **\n** **')
            .addFields({
                name: ` `,
                value:
                    `**__COMMANDS__**\n\n\`/start\`: **REQUIRED TO USE OTHER COMMANDS**\n` +
                    `Run this command to initialize your game profile!`
            }, {
                name: ` `,
                value: `\`/roll\`:\nThe command to roll for gacha/cards! (costs 10 points per roll).`
            }, {
                name: ` `,
                value: `\`/stats\`:\nAllows you to view your total cards and wallet balance.`
            }, {
                name: ` `,
                value: `\`/inventory\`:\nMore detailed view of your card and/or item inventories.`
            }, {
                name: ` `,
                value: `\`/viewcards\`:\nCan sort and view all the cards in the game.`
            }, {
                name: ` `,
                value: `\`/addcard\`:\nAdd your very own card to the game! (costs 500 points).`
            }, {
                name: ` `,
                value: `\`/daily\`:\nYour daily calendar game! Pop 5 ballons a day for free stuff!`
            });
            
        const initialHelpMsg = {
            content: `I'm here for you ${interaction.user}!`,
            embeds: [embed],
            components: []
        }
        await interaction.reply(initialHelpMsg);
    }
}