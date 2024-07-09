import {
    Client,
    ClientOptions,
    REST,
    Routes,
    GatewayIntentBits
  } from 'discord.js';
import { config } from 'dotenv';

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
  
      await rest.put(
        Routes.applicationGuildCommands(clientID!, guildID!),
        {
          body: []
        }
      );
  
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error(error);
    }
  }

  main();