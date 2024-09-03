import { ButtonBuilder, ButtonStyle } from "discord.js"

export namespace BUTTONS {
    export const NEXT_ID: string = 'next';
    export const NEXT_BUTTON = new ButtonBuilder()
        .setCustomId(NEXT_ID)
        .setLabel('Next ➡')
        .setStyle(ButtonStyle.Primary);

    export const PREVIOUS_ID: string = 'previous';
    export const PREVIOUS_BUTTON = new ButtonBuilder()
        .setCustomId(PREVIOUS_ID)
        .setLabel('⬅ Previous')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);

    export const ROLL_AGAIN_ID: string = 'roll_again';
    export const ROLL_AGAIN_BUTTON = new ButtonBuilder()
        .setCustomId(ROLL_AGAIN_ID)
        .setLabel('🔁 Roll Again!')
        .setStyle(ButtonStyle.Danger);

    export const ADD_MESSAGE_ID: string = 'add_message';
    export const ADD_MESSAGE_BUTTON = new ButtonBuilder()
        .setCustomId('add_message')
        .setLabel('✉ Add/Change Message')
        .setStyle(ButtonStyle.Primary);

    export const ADD_USERS_ID: string = 'add_users';
    export const ADD_USERS_BUTTON = new ButtonBuilder()
        .setCustomId('add_users')
        .setLabel('➕ Add Users')
        .setStyle(ButtonStyle.Primary);

    export const SEND_ID: string = 'send';
    export const SEND_BUTTON = new ButtonBuilder()
        .setCustomId('send')
        .setLabel('📤 Send')
        .setStyle(ButtonStyle.Success);

    export const BACK_ID: string = 'back';
    export const BACK_BUTTON = new ButtonBuilder()
        .setCustomId('back')
        .setLabel('⬅ Back')
        .setStyle(ButtonStyle.Danger);

    export const DONE_ID: string = 'done';
    export const DONE_BUTTON = new ButtonBuilder()
        .setCustomId('done')
        .setLabel('✅ Done')
        .setStyle(ButtonStyle.Success);

    export const RESET_ID: string = 'reset';
    export const RESET_BUTTON = new ButtonBuilder()
        .setCustomId('reset')
        .setLabel('🔃 Reset')
        .setStyle(ButtonStyle.Danger);

    export const CANCEL_ID: string = 'cancel';
    export const CANCEL_BUTTON = new ButtonBuilder()
        .setCustomId('cancel')
        .setLabel('❌ Cancel')
        .setStyle(ButtonStyle.Danger);

    export const YES_ID: string = 'yes';
    export const YES_BUTTON = new ButtonBuilder()
        .setCustomId('yes')
        .setLabel('✅ Yes')
        .setStyle(ButtonStyle.Success);
}