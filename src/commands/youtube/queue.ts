import { ChatInputCommandInteraction, EmbedBuilder, ReactionCollector, SlashCommandBuilder } from 'discord.js';
import { Command, DisTubeCommand } from '../../interfaces/Command';
import { MyClient } from '../../classes/MyClient';
import { getProgressBar } from '../../utils/getProgressBar';
import { Commands } from '..';
import { EmbedError, EmbedErrorMessages, errorEmbed } from '../../utils/errorEmbed';
import { replyWrapper } from '../../utils/replyWrapper';

let queueCollector: ReactionCollector;

export class QueueCommand extends Command {
	readonly slashCommandBuilder = new SlashCommandBuilder().setName(DisTubeCommand.QUEUE).setDescription('Lists the current queue of songs.');

	async run(client: MyClient, interaction: ChatInputCommandInteraction<'cached'>) {
		// Clear queue reaction collector
		if (queueCollector) {
			queueCollector.stop();
		}

		const queue = client.distube.getQueue(interaction);
		if (!queue) throw new EmbedError(EmbedErrorMessages.EMPTY_QUEUE);

		const song = queue.songs[0]; // The currently playing song

		const timestampStr = `\`${queue.formattedCurrentTime}\`/\`${song.stream.playFromSource ? song.formattedDuration : song.stream?.['song']?.formattedDuration}\``;

		const reply = await replyWrapper(
			{
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
			interaction
		);

		const replyMessage = await reply.fetch();

		['⏮', '⏹', '⏯', '⏭', '🔀', '🔁'].forEach((reaction) => {
			replyMessage.react(reaction);
		});

		queueCollector = replyMessage.createReactionCollector({
			filter: (reaction, user) => {
				return user.id !== replyMessage.author.id;
			},
			time: song.duration * 1000,
		});

		queueCollector.on('collect', async (reaction, user) => {
			let collectorFlag = true;

			try {
				switch (reaction.emoji.toString()) {
					case '⏮':
						await Commands.get(DisTubeCommand.PREVIOUS).run(client, interaction);
						break;
					case '⏹':
						await Commands.get(DisTubeCommand.STOP).run(client, interaction);
						break;
					case '⏯':
						await Commands.get(DisTubeCommand.PAUSE).run(client, interaction);
						collectorFlag = false;
						break;
					case '⏭':
						await Commands.get(DisTubeCommand.SKIP).run(client, interaction);
						break;
					case '🔀':
						await Commands.get(DisTubeCommand.SHUFFLE).run(client, interaction);
						collectorFlag = false;
						break;
					case '🔁':
						await Commands.get(DisTubeCommand.LOOP).run(client, interaction);
						collectorFlag = false;
						break;
					default:
						return; // Don't stop queue collector if any other reaction added
				}

				if (collectorFlag) queueCollector.stop();
			} catch (error) {
				reaction.users.remove(user);

				if (error instanceof EmbedError) {
					await replyWrapper(errorEmbed(error.embedMessage), interaction);
				} else {
					console.error(error);
				}
			}

			if (!collectorFlag) reaction.users.remove(user);
		});
	}
}
