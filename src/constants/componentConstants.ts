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

    export const UP_ID: string = 'up';
    export const UP_BUTTON = new ButtonBuilder()
        .setCustomId(UP_ID)
        .setLabel('🔼 Up')
        .setStyle(ButtonStyle.Primary);

    export const DOWN_ID: string = 'down';
    export const DOWN_BUTTON = new ButtonBuilder()
        .setCustomId(DOWN_ID)
        .setLabel('🔽 Down')
        .setStyle(ButtonStyle.Primary);

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
    
    export const CARD_DETAILS_ID: string = 'card_details';
    export const CARD_DETAILS_BUTTON = new ButtonBuilder()
        .setCustomId('card_details')
        .setLabel('🃏 Card Details')
        .setStyle(ButtonStyle.Primary);

    export const ITEM_DETAILS_ID: string = 'item_details';
    export const ITEM_DETAILS_BUTTON = new ButtonBuilder()
        .setCustomId('item_details')
        .setLabel('🔮 Item Details')
        .setStyle(ButtonStyle.Primary);

    export const RADOM_ID: string = 'random';
    export const RANDOM_BUTTON = new ButtonBuilder()
        .setCustomId('random')
        .setLabel('🔁 Random')
        .setStyle(ButtonStyle.Primary);

    export const CAST_ID: string = 'cast';
    export const CAST_BUTTON = new ButtonBuilder()
        .setCustomId(CAST_ID)
        .setLabel('👋 Cast')
        .setStyle(ButtonStyle.Success);

    export const FISH_AGAIN_ID: string = 'fish_again';
    export const FISH_AGAIN_BUTTON = new ButtonBuilder()
        .setCustomId('fish_again')
        .setLabel('🔁 Fish Again')
        .setStyle(ButtonStyle.Primary);

    export const WAIT_ID: string = 'wait';
    export const WAIT_BUTTON = new ButtonBuilder()
        .setCustomId('wait')
        .setLabel('Wait...')
        .setStyle(ButtonStyle.Danger);

    export const CATCH_ID: string = 'catch';
    export const CATCH_BUTTON = new ButtonBuilder()
        .setCustomId('catch')
        .setLabel('🎣 Catch!')
        .setStyle(ButtonStyle.Success);

    export const SELECT_ID: string = 'select';
    export const SELECT_BUTTON = new ButtonBuilder()
        .setCustomId('select')
        .setLabel('✅ Select')
        .setStyle(ButtonStyle.Success);
    
    export const UNSELECT_ID: string = 'unselect';
    export const UNSELECT_BUTTON = new ButtonBuilder()
        .setCustomId(UNSELECT_ID)
        .setLabel('❌ Unselect')
        .setStyle(ButtonStyle.Danger);
    
    export const USE_ITEM_ID: string = 'use_item';
    export const USE_ITEM_BUTTON = new ButtonBuilder()
        .setCustomId(USE_ITEM_ID)
        .setLabel('🎒 Use Item(s)')
        .setStyle(ButtonStyle.Primary);
    }