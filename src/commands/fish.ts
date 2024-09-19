import { ChatInputCommandInteraction, IntegrationApplication, SlashCommandBuilder } from "discord.js";
import { DM_NOT_ALLOWED_ERR, PLAYER_DOESNT_EXIST } from '../constants/errors';
import { getFishByID, givePlayerFish, validPlayer } from '../dbFunctions';
import { fishEmbed } from "../utils/embeds";
import { fishCatchTime, getRandomFish, getRandomRarity, randomIntFromInterval, sleep } from "../utils/misc";
import { componentCollector } from "../collectors/componentCollectors";
import { BUTTONS as b } from "../constants/componentConstants"
import { createButtonRow } from "../utils/componentsUils";


export const Fish = {
    info: new SlashCommandBuilder()
        .setName('fish')
        .setDescription('Go fishing!'),

    fishingGame: async (interaction: ChatInputCommandInteraction): Promise<boolean> => {

        const row = createButtonRow([b.WAIT_BUTTON]);
        await interaction.editReply({
            content: `Get read to catch the fish!`,
            components: [row],
            embeds: []
        });

        const rollAgainRow = createButtonRow([b.FISH_AGAIN_BUTTON, b.CANCEL_BUTTON]);
        const rarity = getRandomRarity();

        const waitTime = randomIntFromInterval(500, 5000);
        const waitingButtonID = await componentCollector(interaction, waitTime)

        if (waitingButtonID === b.WAIT_ID) {
            await interaction.editReply({ content: `Too soon! You scared it away! Try Again?`, components: [] });
        } else {

            const biteRow = createButtonRow([b.CATCH_BUTTON]);
            await interaction.editReply({ content: `NOW!`, components: [biteRow] });

            const biteTime = fishCatchTime(rarity);
            const buttonID = await componentCollector(interaction, biteTime);

            if (buttonID === b.CATCH_ID) {
                const fish = await getRandomFish();
                const embed = await fishEmbed(fish);

                const quantity = await givePlayerFish(interaction.user.id, fish.id);

                await interaction.editReply({
                    content: `**CATCH!** You have ${quantity} of these now!`,
                    embeds: [embed],
                    components: []
                });

            } else if (buttonID === null) {
                await interaction.editReply({ content: `Dang, you missed it! Try again?`, embeds: [], components: [] });
            }
        }

        await interaction.editReply({ components: [rollAgainRow] });
        const continueID = await componentCollector(interaction);

        if (continueID === b.FISH_AGAIN_ID) {
            return true;
        } else if (continueID === b.CANCEL_ID) {
            await interaction.editReply({components: [] });
            return false;
        } else if (continueID === null) {
            await interaction.editReply({ content: 'Interaction timed out' });
            return false;
        } else {
            return false;
        }
    },

    run: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.channel) {
            await interaction.reply({ content: DM_NOT_ALLOWED_ERR, ephemeral: true });
            return;
        }

        if (!await validPlayer(interaction.user.id)) {
            await interaction.reply({ content: PLAYER_DOESNT_EXIST, ephemeral: true });
            return;
        }
        await interaction.deferReply();
        let on = true;
        while (on) {
            const fishAgain = await Fish.fishingGame(interaction);
            if (!fishAgain) {
                on = false;
                return;
            } else {
                continue;
            }
        }
    }
}