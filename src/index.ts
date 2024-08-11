import 'dotenv/config';
import { ChatInputCommandInteraction, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { Commands } from './commands';
import { MyClient } from './classes/MyClient';
import { EmbedError, EmbedErrorMessages, errorEmbed } from './utils/errorEmbed';
import { replyWrapper } from './utils/replyWrapper';

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
export const APPLICATION_ID = process.env.APPLICATION_ID;
export const GUILD_ID = process.env.GUILD_ID;

// Create a new client instance
export const client = new MyClient({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions] });

// Log in to Discord with your client's token
client.login(DISCORD_TOKEN);

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(DISCORD_TOKEN);

/*
 * Client Ready
 */
client.once(Events.ClientReady, async (readyClient) => {
	if (!client.user || !client.application) {
		return;
	}

	console.log(`Ready! Logged in as ${readyClient.user.tag}`);

	try {
		console.log('Registering the following commands:');
		console.log(`[${Array.from(Commands.keys()).join(', ')}]`);

		// Registers the commands in the Discord server
		// This process can take up to an hour for results to register on server
		await rest.put(Routes.applicationCommands(APPLICATION_ID), { body: Array.from(Commands.values()).map((command) => command.slashCommandBuilder.toJSON()) });

		console.log(`Finished registering commands.`);
	} catch (error) {
		console.error(error);
	}
});

/*
 * Listens to chat commands and executes run() command
 */
client.on(Events.InteractionCreate, async (interaction: ChatInputCommandInteraction<'cached'>) => {
	if (!interaction.isChatInputCommand()) return;

	const command = Commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.run(client, interaction);
	} catch (error) {
		await replyWrapper(errorEmbed(error.embedMessage || EmbedErrorMessages.GENERAL_ERROR), interaction);

		console.error(error);
	}
});
