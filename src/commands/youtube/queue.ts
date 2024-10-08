import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, MessageActionRowComponentBuilder, SlashCommandBuilder, Snowflake } from 'discord.js';
import { Command, DisTubeCommand, PaginationCommands, RunParams } from '../../interfaces/Command';
import { client } from '../..';
import { EmbedError, EmbedErrorMessages } from '../../utils/errorEmbed';
import { replyWrapper } from '../../utils/replyWrapper';
import { QUEUE_PAGE_COUNT } from '../../lib/envVariables';
import { getProgressBar } from '../../utils/getProgressBar';

//TODO - Add simple option to only output details of current song (for next playing song)
//TODO - Add playlist info in queue output (if applicable)
export class QueueCommand extends Command {
	readonly slashCommandBuilder = new SlashCommandBuilder()
		.setName(DisTubeCommand.QUEUE)
		.setDescription('Lists the current queue of songs.')
		.addBooleanOption((opt) => opt.setName('simple').setDescription('Only display the currently playing song?').setRequired(false));

	public async run({ interaction, channel }: RunParams, page = 1, simple = false) {
		const queue = client.distube.getQueue(interaction?.guildId || channel?.guildId);
		if (!queue) throw new EmbedError(EmbedErrorMessages.EMPTY_QUEUE);

		let simpleFlag;

		if (interaction) {
			if (interaction instanceof ChatInputCommandInteraction) {
				simpleFlag = interaction.options.getBoolean('simple') || simple;
			}

			await interaction.reply('Loading Queue...');
		}

		const sliceQueue = queue.songs.slice(1);

		const song = queue.songs[0]; // The currently playing song
		const timestampStr = `\`${queue.formattedCurrentTime}\`/\`${song.stream.playFromSource ? song.formattedDuration : song.stream?.['song']?.formattedDuration}\``;

		const startCount = (page - 1) * QUEUE_PAGE_COUNT;
		const endCount = page * QUEUE_PAGE_COUNT;
		const maxPage = Math.ceil(sliceQueue.length / QUEUE_PAGE_COUNT);

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
								!simpleFlag && sliceQueue.length > 0
									? `### **Queue:**\n${
											sliceQueue
												.slice(startCount, endCount) // First 20 songs in the list
												.map(
													(song, i) =>
														`**${i + 1 + startCount}.** [${song.name || song.url}](${song.url}) \`[${
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
			channel: channel || interaction.channel,
		});

		/*
		 * Media Buttons
		 */
		const previous = new ButtonBuilder().setCustomId(DisTubeCommand.PREVIOUS).setEmoji('⏮').setStyle(ButtonStyle.Secondary);
		const stop = new ButtonBuilder().setCustomId(DisTubeCommand.STOP).setEmoji('⏹').setStyle(ButtonStyle.Secondary);
		const pause = new ButtonBuilder().setCustomId(DisTubeCommand.PAUSE).setEmoji('⏯').setStyle(ButtonStyle.Secondary);
		const skip = new ButtonBuilder().setCustomId(DisTubeCommand.SKIP).setEmoji('⏭').setStyle(ButtonStyle.Secondary);
		const shuffle = new ButtonBuilder().setCustomId(DisTubeCommand.SHUFFLE).setEmoji('🔀').setStyle(ButtonStyle.Secondary);
		// const loop = new ButtonBuilder().setCustomId(DisTubeCommand.LOOP).setEmoji('🔁').setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(previous, stop, pause, skip, shuffle);

		const components = [row];

		/*
		 * Pagination select
		 */
		if (!simpleFlag && sliceQueue.length > QUEUE_PAGE_COUNT) {
			const previousPage = new ButtonBuilder()
				.setCustomId(JSON.stringify({ id: PaginationCommands.PREVIOUS_PAGE, page }))
				.setEmoji('⬅')
				.setStyle(ButtonStyle.Primary)
				.setDisabled(page === 1);
			const pageCount = new ButtonBuilder().setCustomId('page_count').setLabel(`Page: ${page} of ${maxPage}`).setStyle(ButtonStyle.Secondary).setDisabled(true);
			const nextPage = new ButtonBuilder()
				.setCustomId(JSON.stringify({ id: PaginationCommands.NEXT_PAGE, page, maxPage }))
				.setEmoji('➡')
				.setStyle(ButtonStyle.Primary)
				.setDisabled(page >= maxPage);

			const rowTwo = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(previousPage, pageCount, nextPage);
			components.push(rowTwo);
		}

		await replyWrapper({ message: { components }, channel: channel || interaction.channel });
	}
}
