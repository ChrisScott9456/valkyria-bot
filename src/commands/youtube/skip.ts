import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command, DisTubeCommand, RunParams } from '../../interfaces/Command';
import { client } from '../..';
import { replyWrapper } from '../../utils/replyWrapper';
import { EmbedError, EmbedErrorMessages } from '../../utils/errorEmbed';

//TODO - Add skipping to specific place in queue
export class SkipCommand extends Command {
	public aliases: string[] = ['next'];
	readonly slashCommandBuilder = new SlashCommandBuilder().setName(DisTubeCommand.SKIP).setDescription('Skips to the next song.');

	async run({ interaction, channel }: RunParams) {
		const queue = client.distube.getQueue(interaction || channel);
		if (!queue) throw new EmbedError(EmbedErrorMessages.EMPTY_QUEUE);

		const song = queue.songs[0];

		let title = 'Skipped';

		// If the current song is the last in the queue, stop playing
		// Otherwise, skip song
		if (!client.distube.getQueue(interaction).songs[1]) {
			await client.distube.stop(interaction);
			title = 'Stopped';
		} else {
			await client.distube.skip(interaction);
		}

		await replyWrapper({
			message: {
				embeds: [
					new EmbedBuilder()
						.setColor('Blurple')
						.setTitle(title)
						.setDescription(`**[${song.name || song.url}](${song.url})**\n`),
				],
			},
			interaction,
			channel,
		});
	}
}
