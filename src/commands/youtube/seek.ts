import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command, DisTubeCommand, RunParams } from '../../interfaces/Command';
import { client } from '../..';
import { replyWrapper } from '../../utils/replyWrapper';
import { EmbedError, EmbedErrorMessages } from '../../utils/errorEmbed';

export class SeekCommand extends Command {
	readonly slashCommandBuilder = new SlashCommandBuilder()
		.setName(DisTubeCommand.SEEK)
		.setDescription('Seeks to a current time within the current song.')
		.addNumberOption((option) => option.setName('time').setDescription('The time to seek (in seconds)').setMinValue(0).setRequired(true));

	async run({ interaction }: RunParams) {
		const queue = client.distube.getQueue(interaction);
		if (!queue) throw new EmbedError(EmbedErrorMessages.EMPTY_QUEUE);

		const time = interaction.options.getNumber('time', true);
		if (time > queue.songs[0].duration) throw new EmbedError(EmbedErrorMessages.SEEK_ERROR);

		await queue.seek(time);
		await replyWrapper({
			message: {
				embeds: [new EmbedBuilder().setColor('Blurple').setTitle('Seek')],
			},
			interaction,
		});
	}
}
