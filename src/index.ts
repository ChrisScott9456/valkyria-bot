import 'dotenv/config';
import { Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { Events as DistubeEvents } from 'distube';
import { Commands } from './commands';
import { MyClient } from './classes/MyClient';
import { EmbedErrorMessages, errorEmbed } from './utils/errorEmbed';
import { replyWrapper } from './utils/replyWrapper';
import { createPollJob, endPollJob } from './utils/poll';
import { APPLICATION_ID, DISCORD_TOKEN } from './lib/envVariables';
import { createTables } from './lib/knex';
import { DisTubeCommand } from './interfaces/Command';
import { setDefaultPresence } from './utils/defaultPresence';

// Create a new client instance
export const client = new MyClient({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions],
});

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
		createPollJob.start();
		endPollJob.start();
		await createTables();

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
 * Listens to chat commands and buttons to execute run() command
 */
client.on(Events.InteractionCreate, async (interaction) => {
	if (!(interaction.isChatInputCommand() || interaction.isButton())) return;

	try {
		const command = interaction.isChatInputCommand() ? Commands.get(interaction.commandName) : interaction.isButton() ? Commands.get(interaction.customId) : null;

		await command.run({ interaction });
	} catch (error) {
		await replyWrapper({ message: errorEmbed(error.embedMessage || EmbedErrorMessages.GENERAL_ERROR), interaction });

		console.error(error);
	}
});

/*
 * Listens to when the current distube queue changes songs
 */
client.distube.on(DistubeEvents.PLAY_SONG, async (queue, song) => {
	await Commands.get(DisTubeCommand.QUEUE).run({ channel: queue.textChannel });

	client.user.setPresence({ status: 'online', activities: [{ name: song.name, type: 0, state: song.url }] });
});

client.distube.on(DistubeEvents.FINISH, setDefaultPresence);
client.distube.on(DistubeEvents.DELETE_QUEUE, setDefaultPresence);

/*
 * Listens to and logs any errors that occur
 */
client.on(Events.Error, (error) => {
	console.error(error);
});

client.distube.on(DistubeEvents.ERROR, (error) => {
	console.error(error);
	setDefaultPresence();
});
