import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, MessageActionRowComponentBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User } from "discord.js";
import { Card, Series } from "../constants/definitions";
import { getAllSeries, getCard } from "../dbFunctions";
import { cardEmbed } from "./embeds";
import { BUTTONS as b } from "../constants/componentConstants";
import { componentCollector } from "../collectors/componentCollectors";

export async function cycleButtonStatus(current: number, max: number, previous: ButtonBuilder, next: ButtonBuilder): Promise<void> {
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
    getMsgContent: (currentCard: number, cardAmnt: number) => string,
    back: boolean = false
) {
    let on = true;
    let currentCard = 0;

    const prev = b.PREVIOUS_BUTTON;
    const next = b.NEXT_BUTTON;
    const done = b.DONE_BUTTON;

    let card = await getCard(cards[currentCard].id);
    let embed = await cardEmbed(card);
    let msgContent = getMsgContent(currentCard, cardAmnt);

    await cycleButtonStatus(currentCard, cardAmnt, prev, next);

    const buttons: ButtonBuilder[] = [];
    if(back){
        buttons.push(b.BACK_BUTTON);
    }
    
    buttons.push(prev, next, done);
    const buttonRow = createButtonRow(buttons);

    await interaction.editReply({ content: msgContent, embeds: [embed], components: [buttonRow] });

    while (on) {
        const buttonID = await componentCollector(interaction);

        if (buttonID === b.NEXT_ID) {
            currentCard++;
        } else if (buttonID === b.PREVIOUS_ID) {
            currentCard--;
        } else if (buttonID === b.DONE_ID) {
            on = false;
        } else if (buttonID === null) {
            on = false;
        } else if (buttonID === b.BACK_ID) {
            on = false; 
            return b.BACK_ID;
        }

        // Update card and embed after button press
        if (on) {
            await cycleButtonStatus(currentCard, cardAmnt, prev, next);
            card = await getCard(cards[currentCard].id);
            embed = await cardEmbed(card);
            msgContent = getMsgContent(currentCard, cardAmnt); // Use the dynamic msgContent

            // Update interaction with new card
            await interaction.editReply({ content: msgContent, embeds: [embed], components: [buttonRow] });
        } else {
            await interaction.editReply({ content: msgContent, components: [] });
            break;
        }
    }
}

export function createButton(label: string, customId: string, style: ButtonStyle = ButtonStyle.Primary, disabled: boolean = false): ButtonBuilder {
    return new ButtonBuilder()
        .setLabel(label)
        .setCustomId(customId)
        .setStyle(style)
        .setDisabled(disabled);
}

export function createButtonRow(buttons: ButtonBuilder[]): ActionRowBuilder<MessageActionRowComponentBuilder> {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons);
}

export const viewCardSelect = (): StringSelectMenuBuilder => {
    return new StringSelectMenuBuilder()
	.setCustomId('select')
	.addOptions(
		new StringSelectMenuOptionBuilder()
			.setLabel('Rarity')
			.setValue('rarity')
			.setDescription('View by card rarity'),
        new StringSelectMenuOptionBuilder()
            .setLabel('Series')
            .setValue('series')
            .setDescription('View by card series')
	);
};

export const rarityCardSelect = (): StringSelectMenuBuilder => {
    return new StringSelectMenuBuilder()
        .setCustomId('rarity_select')
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Common')
                .setValue('common')
                .setDescription('View all common cards'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Uncommon')
                .setValue('uncommon')
                .setDescription('View all uncommon cards'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Rare')
                .setValue('rare')
                .setDescription('View all rare cards'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Legendary')
                .setValue('legendary')
                .setDescription('View all legendary cards'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Divine')
                .setValue('divine')
                .setDescription('View all divine cards')
        )
}

export async function seriesCardSelect(series?: Series[]): Promise<StringSelectMenuBuilder> {
    let allSeries: Series[] = [];
    if(series) {
        allSeries = series;
    } else {
        allSeries = await getAllSeries();
    }
    
    const SelectMenu = new StringSelectMenuBuilder()
        .setCustomId('series_select')
    for(let ser of allSeries) {
        SelectMenu.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(ser.name)
                .setValue(ser.name.toLowerCase())
                .setDescription(`The ${ser.name} series`)
        )
    }
    return SelectMenu;
}