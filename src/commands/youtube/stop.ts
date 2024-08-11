import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command, DisTubeCommand } from '../../interfaces/Command';
import { MyClient } from '../../classes/MyClient';
import { replyWrapper } from '../../utils/replyWrapper';
import { EmbedError, EmbedErrorMessages } from '../../utils/errorEmbed';

export class StopCommand extends Command {
	public aliases: string[] = ['clear'];
	readonly slashCommandBuilder = new SlashCommandBuilder().setName(DisTubeCommand.STOP).setDescription('Stops playing and clears the queue.');

	async run(client: MyClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const queue = client.distube.getQueue(interaction);
		if (!queue) throw new EmbedError(EmbedErrorMessages.EMPTY_QUEUE);

		await queue.stop();
		await replyWrapper(
			{
				embeds: [new EmbedBuilder().setColor('Blurple').setTitle('Stopped').setDescription('Cleared the queue.')],
			},
			interaction
		);
	}
}
