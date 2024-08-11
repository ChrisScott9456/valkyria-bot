import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command, DisTubeCommand } from '../../interfaces/Command';
import { Commands } from '..';
import { MyClient } from '../../classes/MyClient';

export class PlayCommand extends Command {
	readonly slashCommandBuilder = new SlashCommandBuilder()
		.setName(DisTubeCommand.PLAY)
		.setDescription('Plays a video from YouTube')
		.addStringOption((opt) => opt.setName('input').setDescription('A YouTube video or playlist URL, or search terms').setRequired(true))
		.addBooleanOption((opt) => opt.setName('skip').setDescription('Skip the current song?').setRequired(false));

	async run(client: MyClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const input = interaction.options.getString('input', true);
		const skip = interaction.options.getBoolean('skip', false) ?? false;
		const vc = interaction.member?.voice?.channel;

		if (!vc) return interaction.reply('You must be in a voice channel to use this command!');

		await client.distube
			.play(vc, input, {
				skip,
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
