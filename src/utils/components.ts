import { ButtonBuilder, ChatInputCommandInteraction, User } from "discord.js";
import { Card } from "../constants/definitions";
import { getCard } from "../dbFunctions";
import { cardEmbed, createButtonRow } from "./misc";
import { BUTTONS as b } from "../constants/buttons";
import { buttonCollector } from "../collectors/buttonCollector";

export async function cycleButtonStatus(current: number, max: number, previous: ButtonBuilder, next: ButtonBuilder ): Promise<void> {
    if (current === 0) {
        previous.setDisabled(true);
    } else {
        previous.setDisabled(false);
    }
    if (current === max - 1) {
        next.setDisabled(true);
    } else {
        next.setDisabled(false);
    }

}

export async function handleCardCycling(
    interaction: ChatInputCommandInteraction,
    cards: Card[],
    cardAmnt: number,
    getMsgContent: (currentCard: number, cardAmnt: number) => string // Pass a function to customize msgContent
) {
    let on = true;
    let currentCard = 0;

    const prev = b.PREVIOUS_BUTTON;
    const next = b.NEXT_BUTTON;
    const done = b.DONE_BUTTON;

    // Generate initial card and embed
    let card = await getCard(cards[currentCard].id);
    let embed = await cardEmbed(card);
    let msgContent = getMsgContent(currentCard, cardAmnt);

    // Cycle buttons for initial state
    await cycleButtonStatus(currentCard, cardAmnt, prev, next);
    const buttonRow = createButtonRow([prev, next, done]);

    // Send initial reply
    await interaction.editReply({ content: msgContent, embeds: [embed], components: [buttonRow] });

    while (on) {
        const buttonID = await buttonCollector(interaction);

        if (buttonID === b.NEXT_ID) {
            currentCard++;
        } else if (buttonID === b.PREVIOUS_ID) {
            currentCard--;
        } else if (buttonID === b.DONE_ID) {
            on = false;
        } else if (buttonID === null) {
            // Collector timed out
            on = false;
        }

        // Update card and embed after button press
        if (on) {
            await cycleButtonStatus(currentCard, cardAmnt, prev, next);
            card = await getCard(cards[currentCard].id);
            embed = await cardEmbed(card);
            msgContent = getMsgContent(currentCard + 1, cardAmnt); // Use the dynamic msgContent

            // Update interaction with new card
            await interaction.editReply({ content: msgContent, embeds: [embed], components: [buttonRow] });
        } else {
            await interaction.editReply({ content: msgContent, components: []});
            break;
        }
    }
}
