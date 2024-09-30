import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command, DisTubeCommand, RunParams } from '../../interfaces/Command';
import { client } from '../..';
import { replyWrapper } from '../../utils/replyWrapper';
import { EmbedError, EmbedErrorMessages } from '../../utils/errorEmbed';

export class StopCommand extends Command {
	public aliases: string[] = ['clear'];
	readonly slashCommandBuilder = new SlashCommandBuilder().setName(DisTubeCommand.STOP).setDescription('Stops playing and clears the queue.');

	async run({ interaction, channel }: RunParams) {
		const queue = client.distube.getQueue(interaction || channel);
		if (!queue) throw new EmbedError(EmbedErrorMessages.EMPTY_QUEUE);

		await queue.stop();
		await replyWrapper({
			message: {
				embeds: [new EmbedBuilder().setColor('Blurple').setTitle('Stopped').setDescription('Cleared the queue.')],
			},
			interaction,
			channel,
		});
	}
}
