import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command, DisTubeCommand, RunParamsChat } from '../../interfaces/Command';
import { client } from '../..';
import { EmbedError, EmbedErrorMessages } from '../../utils/errorEmbed';
import { isYouTubePlaylist } from '../../utils/isYouTubePlaylist';

export class PlayCommand extends Command {
	readonly slashCommandBuilder = new SlashCommandBuilder()
		.setName(DisTubeCommand.PLAY)
		.setDescription('Plays a video or playlist from YouTube.')
		.addStringOption((opt) => opt.setName('input').setDescription('A YouTube video or playlist URL, or search terms').setRequired(true))
		.addBooleanOption((opt) => opt.setName('skip').setDescription('Skip the current song?').setRequired(false));

	async run({ interaction }: RunParamsChat) {
		const input = interaction.options.getString('input', true);
		const skip = interaction.options.getBoolean('skip', false) ?? false;
		const vc = interaction.member?.voice?.channel;

		if (!vc) throw new EmbedError(EmbedErrorMessages.VOICE_CHANNEL_REQUIRED);

		await interaction.reply(`Queueing the ${isYouTubePlaylist(input) ? 'playlist' : 'song'}...`);

		await client.distube
			.play(vc, input, {
				skip,
				textChannel: interaction.channel ?? undefined,
				member: interaction.member,
				metadata: { interaction },
			})
			.catch((e) => {
				console.error(e);
			});

		const queue = client.distube.getQueue(interaction);
		const song = queue.songs[queue.songs.length - 1];

		await interaction.editReply({
			content: null,
			embeds: [
				new EmbedBuilder()
					.setColor('Blurple')
					.setTitle('Queued')
					.setDescription(`**[${song.name || song.url}](${song.url})**\n`),
			],
		});
	}
}
