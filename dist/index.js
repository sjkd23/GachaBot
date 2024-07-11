"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = require("dotenv");
const addcard_1 = require("./commands/addcard");
(0, dotenv_1.config)();
const token = process.env.BOT_TOKEN;
const clientID = process.env.CLIENT_ID;
const guildID = process.env.GUILD_ID;
const intents = [
    discord_js_1.GatewayIntentBits.Guilds,
    discord_js_1.GatewayIntentBits.GuildMembers,
    discord_js_1.GatewayIntentBits.GuildMessages,
    discord_js_1.GatewayIntentBits.MessageContent
];
const options = { intents: intents };
const client = new discord_js_1.Client(options);
client.login(token);
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});
const rest = new discord_js_1.REST({ version: '10' }).setToken(token);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Started refreshing application (/) commands.');
            yield rest.put(discord_js_1.Routes.applicationGuildCommands(clientID, guildID), {
                body: [
                    addcard_1.AddCard.info.toJSON()
                ]
            });
            console.log('Successfully reloaded application (/) commands.');
        }
        catch (error) {
            console.error(error);
        }
    });
}
client.on('interactionCreate', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (!interaction.isChatInputCommand())
        return;
    const { commandName } = interaction;
    console.log(`user ${interaction.user.username} (${interaction.user.id}) ran the '${commandName}' command | Guild: ${interaction.guild} |`
        + ` Channel: ${interaction.channel} | Timestamp: ${interaction.createdAt}`);
    if (commandName === 'addcard') {
        yield addcard_1.AddCard.run(interaction);
    }
}));
main();
