import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { MAX_CARD_NAME_LENGTH, MAX_CARD_AUTHOR_LENGTH, Rarity, Card } from "../constants/definitions";
import { RARITIES } from "../constants/definitions";
import { checkCardList, getCard } from "../dbFunctions";
import { buildCardEmbed, createButtonRow } from "../utils";
import { BUTTONS as b } from "../constants/buttons";
import { buttonCollector } from "../collectors/buttonCollector";

export const ViewCards = {
    info: new SlashCommandBuilder()
        .setName('viewcards')
        .setDescription('Look at all cards in the database, can sort between name, rarity, author and/or URL')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the card you are looking for (not case sensitive)')
                .setMaxLength(MAX_CARD_NAME_LENGTH)
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('rarity')
                .setDescription('The rarity you want to view')
                .addChoices(...RARITIES)
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('url')
                .setDescription('The URL you are looking for. The same picture from a different URL does NOT work.')
        )
        .addStringOption(option =>
            option.setName('author')
                .setDescription('The name of the author you want to search for (usually their discord tag)')
                .setMaxLength(MAX_CARD_AUTHOR_LENGTH)
                .setRequired(false)
        ),

    run: async (interaction: ChatInputCommandInteraction): Promise<void> => {

        const options = interaction.options;

        const name = options.getString('name');
        const rarity = options.getString('rarity');
        const url = options.getString('url');
        const author = options.getString('author');

        const cards: Card[] = await checkCardList({
            name: name || undefined,
            rarity: rarity as Rarity || undefined,
            url: url || undefined,
            author: author || undefined
        });

        if (!cards) {
            await interaction.reply(`No cards were found with the given specifications.`);
        }

        let currentCard = 0;
        let card = await getCard(cards[currentCard].id);
        const cardAmnt = cards.length;
        let embed = await buildCardEmbed(card);

        let msgContent: string;

        if (cardAmnt === 1) {
            msgContent = `Found ${cardAmnt} card!`;
        } else {
            msgContent = `Found ${cardAmnt} cards! (${currentCard + 1}/${cardAmnt})`;
        }

        await buttonStatus(currentCard, cardAmnt);

        const buttonRow = createButtonRow([b.PREVIOUS_BUTTON, b.NEXT_BUTTON, b.DONE_BUTTON])


        try {
            const message = await interaction.reply({ content: msgContent, embeds: [embed], components: [buttonRow] });
        } catch (err) {
            await interaction.reply('An error has occured, please contact a developer');
            return;
        }

        let on = true;
        while (on) {
            const buttonID = await buttonCollector(interaction);

            if (buttonID === b.NEXT_ID) {
                currentCard++;
                await buttonStatus(currentCard, cardAmnt);
                msgContent = `Found ${cardAmnt} cards! (${currentCard + 1}/${cardAmnt})`;
                card = await getCard(cards[currentCard].id);
                embed = await buildCardEmbed(card);
                await interaction.editReply({ content: msgContent, embeds: [embed], components: [buttonRow] })
            }
            if (buttonID === b.PREVIOUS_ID) {
                currentCard--;
                await buttonStatus(currentCard, cardAmnt);
                msgContent = `Found ${cardAmnt} cards! (${currentCard + 1}/${cardAmnt})`;
                card = await getCard(cards[currentCard].id);
                embed = await buildCardEmbed(card);
                await interaction.editReply({ content: msgContent, embeds: [embed], components: [buttonRow] })
            }
            if (buttonID === b.DONE_ID) {
                await interaction.editReply({ content: msgContent, embeds: [embed], components: [] });
                on = false;
            }
        }
    }
}

async function buttonStatus(currentCard: number, cardAmnt: number): Promise<void> {
    if (currentCard === 0) {
        b.PREVIOUS_BUTTON.setDisabled(true);
    } else {
        b.PREVIOUS_BUTTON.setDisabled(false);
    }
    if (currentCard === cardAmnt - 1) {
        b.NEXT_BUTTON.setDisabled(true);
    } else {
        b.NEXT_BUTTON.setDisabled(false);
    }

}