import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { addCardToPlayerInventory, changeWallet } from "../dbFunctions";
import { buildCardEmbed, getRandomCard } from "../utils/misc";


export const Roll = {
    info: new SlashCommandBuilder ()
        .setName('roll')
        .setDescription('Roll for new gacha cards!'),
        
    run: async (interaction: ChatInputCommandInteraction): Promise<void> => {

        
        const ROLL_PRICE = 10;
        const user_id = interaction.user.id;
        
        await interaction.deferReply();

        const newBalance = await changeWallet(user_id, -ROLL_PRICE);

        if(newBalance < 0 ){
            await interaction.reply('You cant afford that!');
            console.log(`${user_id} tried to roll, but didnt have enough in their wallet.`);
            return;
        }

        const card = await getRandomCard();
        const level = await addCardToPlayerInventory(user_id, card.id);
        const embed = await buildCardEmbed(card);

        try {
            await interaction.editReply(`${interaction.user} Rolled and got...`)
            await interaction.channel?.send({
                content: `You have ${newBalance} points remaining`,
                embeds: [embed]
            });

            console.log(`${user_id} rolled and got ${card.id}. Their new wallet balance is ${newBalance} `)
        } catch(err) {
            await interaction.editReply('An error has occurred, please contact a developer');
            return;
        }
    }
}