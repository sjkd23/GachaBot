import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { componentCollector } from "../collectors/componentCollectors";
import { formatTimeLeft, randomPointReward } from "../utils/misc";
import { changeWallet, checkDailyCalendarTime, validPlayer } from "../dbFunctions";
import { DM_NOT_ALLOWED_ERR, PLAYER_DOESNT_EXIST } from "../constants/errors";

const MAX_CLICKS = 5;
export const Daily = {
    info: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Your daily calendar to get free stuff!'),

    run: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.channel) {
            await interaction.reply({content: DM_NOT_ALLOWED_ERR, ephemeral: true});
            return;
        }

        if(!await validPlayer(interaction.user.id)) {
            await interaction.reply({content: PLAYER_DOESNT_EXIST, ephemeral: true});
            return;
        }

        const { canUse, timeLeft } = await checkDailyCalendarTime(interaction.user.id);

        if (!canUse && timeLeft) {
            const formattedTime = formatTimeLeft(timeLeft);
            await interaction.reply({ content: `You must wait ${formattedTime} before you can use the daily calendar again!` })
            return;
        }

        const buttonRows: ActionRowBuilder<ButtonBuilder>[] = [];
        let buttonId = 1;

        for (let i = 0; i < 5; i++) {
            const row = new ActionRowBuilder<ButtonBuilder>();

            for (let j = 0; j < 5; j++) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`button_${buttonId}`)
                        .setLabel('🎈')
                        .setStyle(ButtonStyle.Primary)
                );
                buttonId++;
            }

            buttonRows.push(row);
        }

        let clicksRemaining = MAX_CLICKS;

        const msgContent = (clicksRemaining: number): string => {
            return `Pop the ballons! ${clicksRemaining} clicks left`;
        };

        await interaction.reply({ content: msgContent(clicksRemaining), components: buttonRows });

        let on = true;
        while (on) {
            if (clicksRemaining === 0) {
                await interaction.editReply({
                    content: `You're out of clicks!`, components: buttonRows
                });
                return;
            }
            const id = await componentCollector(interaction);

            if (id === null) {
                return;
            }

            const buttonIdNum = parseInt(id.replace("button_", ""), 10);

            const rowIndex = Math.floor((buttonIdNum - 1) / 5);
            const colIndex = (buttonIdNum - 1) % 5;

            const button =
                buttonRows[rowIndex].components[
                colIndex
                ] as ButtonBuilder;

            button.setDisabled(true);
            button.setLabel("🎁");
            button.setStyle(ButtonStyle.Success);

            const reward = await randomPointReward()

            await changeWallet(interaction.user.id, reward.value);

            clicksRemaining--;
            await interaction.editReply({
                content: `${msgContent(clicksRemaining)}\n\n**${reward.name}!** +${reward.value} points`,
                components: buttonRows
            });
        }
    }
}