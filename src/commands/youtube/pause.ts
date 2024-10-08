import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command, DisTubeCommand, RunParams } from '../../interfaces/Command';
import { client } from '../..';
import { replyWrapper } from '../../utils/replyWrapper';
import { EmbedError, EmbedErrorMessages } from '../../utils/errorEmbed';

export class PauseCommand extends Command {
	readonly slashCommandBuilder = new SlashCommandBuilder().setName(DisTubeCommand.PAUSE).setDescription('Pauses or unpauses the current song.');

	async run({ interaction, channel }: RunParams) {
		const queue = client.distube.getQueue(interaction || channel);
		if (!queue) throw new EmbedError(EmbedErrorMessages.EMPTY_QUEUE);

		let title = 'Paused';

		if (!queue.paused) {
			await queue.pause();
		} else {
			title = 'Unpaused';
			await queue.resume();
		}

		const song = queue.songs[0];
		await replyWrapper({
			message: {
				embeds: [
					new EmbedBuilder()
						.setColor('Blurple')
						.setTitle(title)
						.setThumbnail(song.thumbnail)
						.setAuthor({ name: song.member.displayName, iconURL: song.member.avatarURL() })
						.setDescription(`**[${song.name || song.url}](${song.url})**\n`),
				],
			},
			interaction,
			channel,
		});
	}
}
