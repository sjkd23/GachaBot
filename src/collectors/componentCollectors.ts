import { ChatInputCommandInteraction, MessageComponentInteraction, StringSelectMenuInteraction } from 'discord.js';

export async function componentCollector(
    interaction: ChatInputCommandInteraction,
    timeout = 15000
): Promise<string | null> {
    return new Promise((resolve, reject) => {
        interaction.fetchReply().then((sentMessage) => {
            const collector = sentMessage.createMessageComponentCollector({
                time: timeout
            });

            collector.on('collect', async (i: MessageComponentInteraction | StringSelectMenuInteraction) => {
                if (i.user.id === interaction.user.id) {
                    await i.deferUpdate(); // Ensure the interaction is deferred

                    // Resolve based on the interaction type
                    if (i.isStringSelectMenu()) {
                        resolve(i.values[0]);
                    } else if (i.isButton()) {
                        resolve(i.customId);
                    }

                    collector.stop(); // Stop the collector after resolving the interaction
                } else {
                    await i.reply({
                        content: `This interaction is for ${interaction.user.username}, not you!`,
                        ephemeral: true
                    });
                }
            });

            collector.on('end', (collected) => {
                if (collected.size === 0) {
                    resolve(null); // Properly resolve null when the collector ends without interaction
                }
            });
        }).catch((error) => {
            reject(`Error fetching message: ${error}`);
        });
    });
}
