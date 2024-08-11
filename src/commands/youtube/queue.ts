import { ChatInputCommandInteraction, EmbedBuilder, ReactionCollector, SlashCommandBuilder } from 'discord.js';
import { Command, DisTubeCommand } from '../../interfaces/Command';
import { MyClient } from '../../classes/MyClient';
import { getProgressBar } from '../../utils/getProgressBar';
import { Commands } from '..';
import { emptyQueue } from '../../utils/emptyQueue';

let queueCollector: ReactionCollector;

export class QueueCommand extends Command {
	readonly slashCommandBuilder = new SlashCommandBuilder().setName(DisTubeCommand.QUEUE).setDescription('Show queue');

	async run(client: MyClient, interaction: ChatInputCommandInteraction<'cached'>) {
		// Clear queue reaction collector
		if (queueCollector) {
			queueCollector.stop();
		}

		const queue = client.distube.getQueue(interaction);
		if (!queue) return interaction.reply(emptyQueue());

		const song = queue.songs[0]; // The currently playing song

		const timestampStr = `\`${queue.formattedCurrentTime}\`/\`${song.stream.playFromSource ? song.formattedDuration : song.stream?.['song']?.formattedDuration}\``;

		await interaction.reply({
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
											.map((song, i) => `**${i + 1}.** [${song.name || song.url}](${song.url}) \`[${song.stream.playFromSource ? song.formattedDuration : song.stream?.['song']?.formattedDuration}]\``)
											.join('\n') || 'None'
								  }\n`
								: null,
						].join('\n')
					)
					.setFooter({ text: `Source: ${song.uploader.name}` }),
			],
		});

		const reply = await interaction.fetchReply();

		['⏮', '⏹', '⏯', '⏭', '🔀', '🔁'].forEach((reaction) => {
			reply.react(reaction);
		});

		queueCollector = reply.createReactionCollector({
			filter: (reaction, user) => {
				return user.id !== reply.author.id;
			},
			time: song.duration * 1000,
		});

		queueCollector.on('collect', (reaction, user) => {
			switch (reaction.emoji.toString()) {
				case '⏮':
					Commands.get(DisTubeCommand.PREVIOUS).run(client, interaction);
					interaction.channel.send('Previous');
					break;
				case '⏹':
					Commands.get(DisTubeCommand.STOP).run(client, interaction);
					interaction.channel.send('Stop');
					break;
				case '⏯':
					Commands.get(DisTubeCommand.PLAY).run(client, interaction);
					interaction.channel.send('Play/Pause');
					break;
				case '⏭':
					Commands.get(DisTubeCommand.SKIP).run(client, interaction);
					interaction.channel.send('Skip');
					break;
				case '🔀':
					Commands.get(DisTubeCommand.SHUFFLE).run(client, interaction);
					interaction.channel.send('Shuffle');
					break;
				case '🔁':
					Commands.get(DisTubeCommand.LOOP).run(client, interaction);
					interaction.channel.send('Loop');
					break;
				default:
					return; // Don't stop queue collector if any other reaction added
			}

			queueCollector.stop();
		});

		queueCollector.on('end', (collected) => {
			interaction.channel.send('End Collector');
		});
	}
}
