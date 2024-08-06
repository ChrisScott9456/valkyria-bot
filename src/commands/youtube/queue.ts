import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DisTubeCommand } from '../../interfaces/Command';
import { RepeatMode } from 'distube';
import { MyClient } from '../../classes/MyClient';

export class QueueCommand extends DisTubeCommand {
	readonly slashCommandBuilder = new SlashCommandBuilder().setName('queue').setDescription('Show queue');

	async run(client: MyClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const queue = client.distube.getQueue(interaction);
		if (!queue) return; // Handled by playing property
		const song = queue.songs[0];
		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor('Blurple')
					.setTitle('DisTube')
					.setDescription(
						[
							`**Current:** \`${song.name || song.url}\` - \`${queue.formattedCurrentTime}\`/\`${song.stream.playFromSource ? song.formattedDuration : song.stream?.['song']?.formattedDuration}\`\n`,
							`**Up next**\n${
								queue.songs
									.slice(1, 10)
									.map((song, i) => `**${i + 1}.** \`${song.name || song.url}\``)
									.join('\n') || 'None'
							}`,
						].join('\n')
					)
					.addFields(
						{
							name: 'Volume',
							value: `${queue.volume}%`,
							inline: true,
						},
						{
							name: 'Autoplay',
							value: `${queue.autoplay ? 'On' : 'Off'}`,
							inline: true,
						},
						{
							name: 'Loop',
							value: `${queue.repeatMode === RepeatMode.QUEUE ? 'Queue' : queue.repeatMode === RepeatMode.SONG ? 'Song' : 'Off'}`,
							inline: true,
						},
						{
							name: 'Filters',
							value: `${queue.filters.names.join(', ') || 'Off'}`,
							inline: false,
						}
					),
			],
		});
	}
}
