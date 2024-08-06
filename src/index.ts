import 'dotenv/config';
import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { Commands } from './commands';

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

/*
 * Client Ready
 */
client.once(Events.ClientReady, async (readyClient) => {
	if (!client.user || !client.application) {
		return;
	}

	await client.application.commands.set(Commands);

	console.log(`Ready! Logged in as ${readyClient.user.tag}`);

	try {
		console.log(`Started updating ${Commands.length} application (/) commands.`);

		// Registers the commands in the Discord server
		// This process can take up to an hour for results to register on server
		await rest.put(Routes.applicationCommands(process.env.APPLICATION_ID), { body: Commands });

		console.log(`Finished updating ${Commands.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
});

/*
 * Listens to chat commands and executes run() command
 */
client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = Commands.find((command) => command.name === interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.run(client, interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});
