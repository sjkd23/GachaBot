import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { changeWallet } from "../dbFunctions";
import { buildCardEmbed, getRandomCard } from "../utils";


export const Roll = {
    info: new SlashCommandBuilder ()
        .setName('roll')
        .setDescription('Roll for new gacha cards!'),
        
    run: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const ROLL_PRICE = 10;
        const id = interaction.user.id;
        const afford = await changeWallet(id, ROLL_PRICE);

        if(afford === false){
            await interaction.reply('You cant afford that!');
            return;
        }

        const card = await getRandomCard();

        const embed = await buildCardEmbed(card);

        try {
            await interaction.reply({
                content: `${interaction.user} Rolled and got...`,
                embeds: [embed]
            });
        } catch(err) {
            await interaction.reply('An error has occurred, please contact a developer');
            return;
        }
    }
}