import { ChatInputCommandInteraction, SlashCommandBuilder, User } from "discord.js";
import { addCardToPlayerInventory, changeWallet, validPlayer } from "../dbFunctions";
import { getRandomCard } from "../utils/misc";
import { DM_NOT_ALLOWED_ERR, PLAYER_DOESNT_EXIST } from "../constants/errors";
import { Card } from "../constants/definitions";
import { handleCardCycling } from "../utils/componentsUils";
import { cardEmbed } from "../utils/embeds";


export const Roll = {
    info: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll for new gacha cards! (Costs 10 points per roll)')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Min 1, Max 10; leave blank to roll once!')
                .setRequired(false)
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

        const ROLL_PRICE = 10;
        const user_id = interaction.user.id;

        const amount = interaction.options.getInteger('amount') ?? 1;

        if (amount && amount < 0 && amount > 10) {
            await interaction.reply('Please enter a valid number of rolls!')
        }
        await interaction.deferReply();

        const newBalance = await changeWallet(user_id, -ROLL_PRICE * amount);

        if (newBalance < 0) {
            await interaction.reply('You cant afford that!');
            console.log(`${user_id} tried to roll, but didnt have enough in their wallet.`);
            return;
        }

        const cards: Card[] = [];
        for (let i = 0; i < amount; i++) {
            const card = await getRandomCard();
            await addCardToPlayerInventory(user_id, card.id)
            cards.push(card);
        }

        if (amount === 1) {
            const embed = await cardEmbed(cards[0])
            await interaction.editReply({ content: 'You rolled and got...', embeds: [embed] })
        } else {
            const getMsgContent = (currentCard: number, cardAmnt: number, user?: User): string => {
                return `You rolled and got... (${currentCard + 1}/${cardAmnt})`;
            }

            await handleCardCycling(interaction, cards, amount, getMsgContent);
        }

    }
}