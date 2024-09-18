import {
  Client,
  ClientOptions,
  REST,
  Routes,
  GatewayIntentBits
} from 'discord.js';
import { config } from 'dotenv';
import { AddCard } from './commands/addcard';
import { ViewCards } from './commands/viewcards';
import { Roll } from './commands/roll';
import { Stats } from './commands/stats';
import { Inventory } from './commands/inventory';

config();

const token = process.env.BOT_TOKEN;
const clientID = process.env.CLIENT_ID;
const guildID = process.env.GUILD_ID;

const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent
];

const options: ClientOptions = { intents: intents };

const client = new Client(options);

client.login(token);

client.once('ready', () => {
  console.log(`Logged in as ${client.user!.tag}`);
});

const rest = new REST({ version: '10' }).setToken(token!);

async function main() {
  try {
    console.log('Started refreshing application (/) commands.');

    const addCardCommand = await AddCard();
    const viewCardCommand = await ViewCards();

    await rest.put(
      Routes.applicationGuildCommands(clientID!, guildID!),
      {
        body: [
          addCardCommand.info.toJSON(),
          viewCardCommand.info.toJSON(),
          Roll.info.toJSON(),
          Stats.info.toJSON(),
          Inventory.info.toJSON()
        ]
      }
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }

}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  console.log(
    `user ${interaction.user.username} (${interaction.user.id}) ran the '${commandName}' command | Guild: ${interaction.guild} |`
    + ` Channel: ${interaction.channel} | Timestamp: ${interaction.createdAt}`);

  if (commandName === 'addcard') {
    const addCardCommand = await AddCard();
    await addCardCommand.run(interaction);
  }
  if (commandName === 'viewcards') {
    const viewCardCommand = await ViewCards();
    await viewCardCommand.run(interaction);
  }
  if (commandName === 'roll') {
    await Roll.run(interaction);
  }
  if (commandName === 'stats') {
    await Stats.run(interaction);
  }
  if (commandName === 'inventory') {
    await Inventory.run(interaction);
  }
})

main();