import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command, DisTubeCommand, RunParams } from '../../interfaces/Command';
import { client } from '../..';
import { replyWrapper } from '../../utils/replyWrapper';
import { EmbedError, EmbedErrorMessages } from '../../utils/errorEmbed';

export class PreviousCommand extends Command {
	readonly slashCommandBuilder = new SlashCommandBuilder().setName(DisTubeCommand.PREVIOUS).setDescription('Plays the previously queued song, if one exists.');

	async run({ interaction, channel }: RunParams) {
		const queue = client.distube.getQueue(interaction || channel);
		if (!queue) throw new EmbedError(EmbedErrorMessages.EMPTY_QUEUE);
		if (queue.previousSongs.length <= 0) throw new EmbedError(EmbedErrorMessages.NO_PREVIOUS_SONGS);

		await queue.previous();

		const song = queue.previousSongs[0];
		await replyWrapper({
			message: {
				embeds: [
					new EmbedBuilder()
						.setColor('Blurple')
						.setTitle('Previous')
						.setDescription(`**[${song.name || song.url}](${song.url})**\n`),
				],
			},
			interaction,
		});
	}
}
