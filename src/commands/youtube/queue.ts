import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command, DisTubeCommand, RunParams } from '../../interfaces/Command';
import { client } from '../..';
import { getProgressBar } from '../../utils/getProgressBar';
import { EmbedError, EmbedErrorMessages, errorEmbed } from '../../utils/errorEmbed';
import { replyWrapper } from '../../utils/replyWrapper';

export class QueueCommand extends Command {
	readonly slashCommandBuilder = new SlashCommandBuilder().setName(DisTubeCommand.QUEUE).setDescription('Lists the current queue of songs.');

	async run({ interaction, channel }: RunParams) {
		const queue = client.distube.getQueue(interaction?.guildId || channel?.guildId);
		if (!queue) throw new EmbedError(EmbedErrorMessages.EMPTY_QUEUE);

		const song = queue.songs[0]; // The currently playing song

		const timestampStr = `\`${queue.formattedCurrentTime}\`/\`${song.stream.playFromSource ? song.formattedDuration : song.stream?.['song']?.formattedDuration}\``;

		await replyWrapper({
			message: {
				embeds: [
					new EmbedBuilder()
						.setColor('Blurple')
						.setTitle('Now Playing')
						.setThumbnail(song.thumbnail)
						.setAuthor({ name: song.member.displayName, iconURL: song.member.avatarURL() })
						.setDescription(
							[
								// Song name and hyperlink
								`**[${song.name || song.url}](${song.url})**\n`,
								// Display current time left on current song from total song length
								`${getProgressBar(20, queue.currentTime / song.duration)} ${timestampStr}`,
								// If there are any other songs in the queue, display list
								queue.songs.slice(1).length > 0
									? `### **Queue:**\n${
											queue.songs
												.slice(1) // Ignore current song
												.map(
													(song, i) =>
														`**${i + 1}.** [${song.name || song.url}](${song.url}) \`[${
															song.stream.playFromSource ? song.formattedDuration : song.stream?.['song']?.formattedDuration
														}]\``
												)
												.join('\n') || 'None'
									  }\n`
									: null,
							].join('\n')
						)
						.setFooter({ text: `Source: ${song.uploader.name}` }),
				],
			},
			interaction,
			channel,
		});

		/*
		 * Media Buttons
		 */
		const previous = new ButtonBuilder().setCustomId(DisTubeCommand.PREVIOUS).setEmoji('⏮').setStyle(ButtonStyle.Secondary);
		const pause = new ButtonBuilder().setCustomId(DisTubeCommand.PAUSE).setEmoji('⏯').setStyle(ButtonStyle.Secondary);
		const skip = new ButtonBuilder().setCustomId(DisTubeCommand.SKIP).setEmoji('⏭').setStyle(ButtonStyle.Secondary);
		const shuffle = new ButtonBuilder().setCustomId(DisTubeCommand.SHUFFLE).setEmoji('🔀').setStyle(ButtonStyle.Secondary);
		const loop = new ButtonBuilder().setCustomId(DisTubeCommand.LOOP).setEmoji('🔁').setStyle(ButtonStyle.Secondary);
		const row = new ActionRowBuilder<any>().addComponents(previous, pause, skip, shuffle, loop);

		await replyWrapper({ message: { components: [row] }, interaction, channel });
	}
}
