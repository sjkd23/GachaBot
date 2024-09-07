import { ChatInputCommandInteraction, Message } from "discord.js";

export async function singleMessageCollector(interaction: ChatInputCommandInteraction): Promise<string> {
    return new Promise((resolve, reject) => {

        const filter = (m: Message) => m.author.id === interaction.user.id;

        const collector = interaction.channel?.createMessageCollector({ filter, time: 15000 });

        collector?.on('collect', (m: Message) => {
            resolve(m.content);
            collector.stop();
        });

        collector?.on('end', collected => {
            if (collected.size === 0) {
                reject(new Error('No message collected within the time limit.'));
            }
        });
    });
}
