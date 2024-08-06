import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DisTubeCommand } from '../../interfaces/Command';
import { Commands } from '..';
import { MyClient } from '../../classes/MyClient';

export class PlayCommand extends DisTubeCommand {
	override readonly inVoiceChannel = true;

	readonly slashCommandBuilder = new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays a video from YouTube')
		.addStringOption((opt) => opt.setName('input').setDescription('A supported URL or a search query').setRequired(true))
		.addBooleanOption((opt) => opt.setName('skip').setDescription('Skip the current song').setRequired(false))
		.addIntegerOption((opt) => opt.setName('position').setDescription('Position will be added to the queue').setRequired(false));

	async run(client: MyClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const input = interaction.options.getString('input', true);
		const skip = interaction.options.getBoolean('skip', false) ?? false;
		const position = interaction.options.getInteger('position', false) ?? undefined;
		const vc = interaction.member?.voice?.channel;
		if (!vc) return interaction.reply('You must be in a voice channel to use this command!'); // Handled by inVoiceChannel property
		await client.distube
			.play(vc, input, {
				skip,
				position,
				textChannel: interaction.channel ?? undefined,
				member: interaction.member,
				metadata: { interaction },
			})
			.catch((e) => {
				console.error(e);
				interaction.editReply({
					embeds: [new EmbedBuilder().setColor('Blurple').setTitle('DisTube').setDescription('Error!')],
				});
			});

		//! Execute /queue command
		Commands.get('queue').run(client, interaction);
	}
}
