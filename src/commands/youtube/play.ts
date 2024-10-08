import { SlashCommandBuilder } from 'discord.js';
import { Command, DisTubeCommand, RunParamsChat } from '../../interfaces/Command';
import { client } from '../..';
import { EmbedError, EmbedErrorMessages } from '../../utils/errorEmbed';
import { isYouTubePlaylist } from '../../utils/isYouTubePlaylist';

export class PlayCommand extends Command {
	readonly slashCommandBuilder = new SlashCommandBuilder()
		.setName(DisTubeCommand.PLAY)
		.setDescription('Plays a video or playlist from YouTube.')
		.addStringOption((opt) => opt.setName('input').setDescription('A YouTube video or playlist URL, or search terms').setRequired(true))
		.addBooleanOption((opt) => opt.setName('shuffle').setDescription('Shuffle the input playlist?').setRequired(false));

	async run({ interaction }: RunParamsChat) {
		const input = interaction.options.getString('input', true);
		const shuffle = interaction.options.getBoolean('shuffle', false) ?? false;
		const vc = interaction.member?.voice?.channel;

		if (!vc) throw new EmbedError(EmbedErrorMessages.VOICE_CHANNEL_REQUIRED);

		await interaction.reply(`Queueing ${isYouTubePlaylist(input) ? 'Playlist' : 'Song'}...`);

		await client.distube
			.play(vc, input, {
				textChannel: interaction.channel ?? undefined,
				member: interaction.member,
				metadata: { interaction },
			})
			.catch((e) => {
				console.error(e);
			});

		if (shuffle) client.distube.shuffle(interaction);
	}
}
