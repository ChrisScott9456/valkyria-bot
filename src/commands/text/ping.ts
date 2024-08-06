import { ApplicationCommandType, Client, CommandInteraction } from 'discord.js';
import { Command } from '../../interfaces/Command';

export const Ping: Command = {
	name: 'ping',
	description: 'Replies with Pong!',
	type: ApplicationCommandType.ChatInput,
	run: async (client: Client, interaction: CommandInteraction) => {
		await interaction.reply('Pong!');
	},
};
