import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command, DisTubeCommand } from '../../interfaces/Command';
import { MyClient } from '../../classes/MyClient';
import { replyWrapper } from '../../utils/replyWrapper';
import { EmbedError, EmbedErrorMessages } from '../../utils/errorEmbed';
import { Commands } from '..';

export class ShuffleCommand extends Command {
	readonly slashCommandBuilder = new SlashCommandBuilder().setName(DisTubeCommand.SHUFFLE).setDescription('Shuffles the current queue of songs.');

	async run(client: MyClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const queue = client.distube.getQueue(interaction);
		if (!queue) throw new EmbedError(EmbedErrorMessages.EMPTY_QUEUE);

		await queue.shuffle();
		await replyWrapper(
			{
				embeds: [new EmbedBuilder().setColor('Blurple').setTitle('Shuffled!')],
			},
			interaction
		);

		//! Execute /queue command
		Commands.get('queue').run(client, interaction);
	}
}