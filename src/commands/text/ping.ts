import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { MyClient } from '../../classes/MyClient';
import { replyWrapper } from '../../utils/replyWrapper';

export class PingCommand extends Command {
	readonly slashCommandBuilder = new SlashCommandBuilder().setName('ping').setDescription('Pong!');

	async run(client: MyClient, interaction: ChatInputCommandInteraction<'cached'>) {
		await replyWrapper('Pong!', interaction);
	}
}
