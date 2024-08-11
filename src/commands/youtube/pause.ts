import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command, DisTubeCommand } from '../../interfaces/Command';
import { MyClient } from '../../classes/MyClient';
import { replyWrapper } from '../../utils/replyWrapper';
import { EmbedError, EmbedErrorMessages } from '../../utils/errorEmbed';

export class PauseCommand extends Command {
	readonly slashCommandBuilder = new SlashCommandBuilder().setName(DisTubeCommand.PAUSE).setDescription('Pauses or unpauses the current song.');

	async run(client: MyClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const queue = client.distube.getQueue(interaction);
		if (!queue) throw new EmbedError(EmbedErrorMessages.EMPTY_QUEUE);

		let title = 'Paused';

		if (!queue.paused) {
			await queue.pause();
		} else {
			title = 'Unpaused';
			await queue.resume();
		}

		const song = queue.songs[0];
		await replyWrapper(
			{
				embeds: [
					new EmbedBuilder()
						.setColor('Blurple')
						.setTitle(title)
						.setDescription(`**[${song.name || song.url}](${song.url})**\n`),
				],
			},
			interaction
		);
	}
}
