import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command, DisTubeCommand, RunParams } from '../../interfaces/Command';
import { client } from '../..';
import { replyWrapper } from '../../utils/replyWrapper';
import { EmbedError, EmbedErrorMessages } from '../../utils/errorEmbed';

export class SkipCommand extends Command {
	public aliases: string[] = ['next'];
	readonly slashCommandBuilder = new SlashCommandBuilder()
		.setName(DisTubeCommand.SKIP)
		.setDescription('Skips to the next song.')
		.addNumberOption((opt) => opt.setName('position').setDescription('The specific position of a song in the queue you want to skip to').setRequired(false));

	async run({ interaction, channel }: RunParams) {
		const queue = client.distube.getQueue(interaction || channel);
		if (!queue) throw new EmbedError(EmbedErrorMessages.EMPTY_QUEUE);

		let position = 1;

		if (interaction.isChatInputCommand()) {
			position = interaction.options.getNumber('position') || 1;
		}

		const song = queue.songs[0];

		let title = 'Skipped';

		// If the current song is the last in the queue, stop playing
		// Otherwise, skip song
		if (!client.distube.getQueue(interaction).songs[1]) {
			await client.distube.stop(interaction);
			title = 'Stopped';
		} else {
			await client.distube.jump(interaction, position);
		}

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
