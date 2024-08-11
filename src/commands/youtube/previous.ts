import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command, DisTubeCommand } from '../../interfaces/Command';
import { MyClient } from '../../classes/MyClient';
import { replyWrapper } from '../../utils/replyWrapper';
import { EmbedError, EmbedErrorMessages } from '../../utils/errorEmbed';
import { Commands } from '..';

export class PreviousCommand extends Command {
	readonly slashCommandBuilder = new SlashCommandBuilder().setName(DisTubeCommand.PREVIOUS).setDescription('Plays the previously queued song, if one exists.');

	async run(client: MyClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const queue = client.distube.getQueue(interaction);
		if (!queue) throw new EmbedError(EmbedErrorMessages.EMPTY_QUEUE);
		if (queue.previousSongs.length <= 0) throw new EmbedError(EmbedErrorMessages.NO_PREVIOUS_SONGS);

		await queue.previous();

		const song = queue.previousSongs[0];
		await replyWrapper(
			{
				embeds: [
					new EmbedBuilder()
						.setColor('Blurple')
						.setTitle('Previous')
						.setDescription(`**[${song.name || song.url}](${song.url})**\n`),
				],
			},
			interaction
		);

		//! Execute /queue command
		Commands.get('queue').run(client, interaction);
	}
}
