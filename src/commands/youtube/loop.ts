import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command, DisTubeCommand } from '../../interfaces/Command';
import { MyClient } from '../../classes/MyClient';
import { replyWrapper } from '../../utils/replyWrapper';
import { EmbedError, EmbedErrorMessages } from '../../utils/errorEmbed';
import { RepeatMode } from 'distube';

function mapRepeatMode(mode: RepeatMode) {
	switch (mode) {
		case RepeatMode.DISABLED:
			return 'Disabled';
		case RepeatMode.SONG:
			return 'Song';
		case RepeatMode.QUEUE:
			return 'Queue';
	}
}

export class LoopCommand extends Command {
	readonly slashCommandBuilder = new SlashCommandBuilder().setName(DisTubeCommand.LOOP).setDescription('Cycles through the loop modes: Disabled -> Song -> Queue');

	async run(client: MyClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const queue = client.distube.getQueue(interaction);
		if (!queue) throw new EmbedError(EmbedErrorMessages.EMPTY_QUEUE);

		await queue.setRepeatMode();
		await replyWrapper(
			{
				embeds: [
					new EmbedBuilder()
						.setColor('Blurple')
						.setTitle('Loop')
						.setDescription(`Loop Mode set to: **${mapRepeatMode(queue.repeatMode)}**`),
				],
			},
			interaction
		);
	}
}
