import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command, DisTubeCommand } from '../../interfaces/Command';
import { MyClient } from '../../classes/MyClient';
import { replyWrapper } from '../../utils/replyWrapper';
import { EmbedError, EmbedErrorMessages } from '../../utils/errorEmbed';
import { Commands } from '..';

export class SeekCommand extends Command {
	readonly slashCommandBuilder = new SlashCommandBuilder()
		.setName(DisTubeCommand.SEEK)
		.setDescription('Seeks to a current time within the current song.')
		.addNumberOption((option) => option.setName('time').setDescription('The time to seek (in seconds)').setMinValue(0).setRequired(true));

	async run(client: MyClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const queue = client.distube.getQueue(interaction);
		if (!queue) throw new EmbedError(EmbedErrorMessages.EMPTY_QUEUE);

		const time = interaction.options.getNumber('time', true);
		if (time > queue.songs[0].duration) throw new EmbedError(EmbedErrorMessages.SEEK_ERROR);

		await queue.seek(time);
		await replyWrapper(
			{
				embeds: [new EmbedBuilder().setColor('Blurple').setTitle('Seek')],
			},
			interaction
		);

		//! Execute /queue command
		Commands.get('queue').run(client, interaction);
	}
}
