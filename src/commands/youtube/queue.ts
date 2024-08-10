import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DisTubeCommand } from '../../interfaces/Command';
import { RepeatMode } from 'distube';
import { MyClient } from '../../classes/MyClient';

export class QueueCommand extends DisTubeCommand {
	readonly slashCommandBuilder = new SlashCommandBuilder().setName('queue').setDescription('Show queue');

	async run(client: MyClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const queue = client.distube.getQueue(interaction);
		if (!queue) return interaction.reply('Nothing in the queue currently');

		const song = queue.songs[0]; // The currently playing song
		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor('Blurple')
					.setTitle('Now Playing')
					.setThumbnail(song.thumbnail)
					.setAuthor({ name: song.user.displayName, iconURL: song.user.avatarURL() })
					.setDescription(
						[
							// Song name and hyperlink
							`### **[${song.name || song.url}](${song.url})**\n`,
							// Display current time left on current song from total song length
							`\`${queue.formattedCurrentTime}\`/\`${song.stream.playFromSource ? song.formattedDuration : song.stream?.['song']?.formattedDuration}\``,
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
	}
}
