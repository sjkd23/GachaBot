import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, MessageActionRowComponentBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User } from "discord.js";
import { Card, Item, Player, PlayerItemInventory, Series } from "../constants/definitions";
import { getAllSeries, getCard } from "../dbFunctions";
import { cardEmbed, highlightSelection, itemInventoryEmbed } from "./embeds";
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
    if (back) {
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
    if (series) {
        allSeries = series;
    } else {
        allSeries = await getAllSeries();
    }

    const SelectMenu = new StringSelectMenuBuilder()
        .setCustomId('series_select')
    for (let ser of allSeries) {
        SelectMenu.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(ser.name)
                .setValue(ser.name.toLowerCase())
                .setDescription(`The ${ser.name} series`)
        )
    }
    return SelectMenu;
}

export async function itemPicker(
    interaction: ChatInputCommandInteraction,
    playerItems: PlayerItemInventory[],
    gameID: number
): Promise<PlayerItemInventory[]> {

    const gameItems = playerItems.filter(item => item.item.game_id === gameID);


    let currentItem = 0;

    const chosenItems: PlayerItemInventory[] = [];
    const selected: number[] = [];
    let on = true;
    while (on) {

        const row = new ActionRowBuilder<MessageActionRowComponentBuilder>();
        if (currentItem >= gameItems.length - 1) {
            b.DOWN_BUTTON.setDisabled(true);
        } else {
            b.DOWN_BUTTON.setDisabled(false);
        }
        if (currentItem <= 0) {
            b.UP_BUTTON.setDisabled(true);
        } else {
            b.UP_BUTTON.setDisabled(false);
        }
        if (selected.includes(currentItem)) {
            row.setComponents([b.UP_BUTTON, b.DOWN_BUTTON, b.UNSELECT_BUTTON]);
        } else {
            row.setComponents([b.UP_BUTTON, b.DOWN_BUTTON, b.SELECT_BUTTON]);
        }
        if (selected.length > 0) {
            row.addComponents([b.DONE_BUTTON, b.BACK_BUTTON])
        } else {
            row.addComponents([b.BACK_BUTTON])
        }

        await interaction.editReply({
            content: 'Please pick an item',
            embeds: [highlightSelection(await itemInventoryEmbed(interaction.user, gameItems,), currentItem, selected)],
            components: [row]
        })

        const buttonID = await componentCollector(interaction);

        if (buttonID === b.SELECT_ID) {
            // Add the current item to chosenItems and selected
            chosenItems.push(gameItems[currentItem]);
            selected.push(currentItem);
        } else if (buttonID === b.UNSELECT_ID) {
            // Find the index of currentItem in selected
            const indexInSelected = selected.indexOf(currentItem);
            if (indexInSelected > -1) {
                selected.splice(indexInSelected, 1);
            }

            // Find the corresponding item in chosenItems
            const itemToRemove = gameItems[currentItem];
            const indexInChosenItems = chosenItems.findIndex(
                (item) => item.item.id === itemToRemove.item.id
            );
            if (indexInChosenItems > -1) {
                chosenItems.splice(indexInChosenItems, 1);
            }
            
        } else if (buttonID === b.UP_ID) {
            currentItem--;

        } else if (buttonID === b.DOWN_ID) {
            currentItem++;

        } else if (buttonID === b.DONE_ID) {
            on = false;

        } else if (buttonID === b.BACK_ID) {
            chosenItems.splice(0, chosenItems.length)
            on = false;

        } else if (buttonID === null) {
            on = false;
        }
    }
    return chosenItems;
}