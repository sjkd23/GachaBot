import { ButtonBuilder, ChatInputCommandInteraction, ComponentType, Message, MessageComponentInteraction } from 'discord.js';

export async function buttonCollector(
    interaction: ChatInputCommandInteraction,
    timeout = 15000
): Promise<string | null> {
    return new Promise((resolve, reject) => {
        const message = interaction.fetchReply() as Promise<Message>; // Fetch the existing message

        message.then(sentMessage => {
            const collector = sentMessage.createMessageComponentCollector({ componentType: ComponentType.Button, time: timeout });

            collector.on('collect', (i: MessageComponentInteraction) => {
                if (i.user.id === interaction.user.id) {
                    i.deferUpdate();
                    collector.stop();
                    resolve(i.customId);
                } else {
                    i.reply({ content: `These buttons are for ${interaction.user.username}, not you!`, ephemeral: true });
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    resolve(null);
                }
            });
        }).catch(error => {
            reject(`Error fetching message: ${error}`);
        });
    });
}
