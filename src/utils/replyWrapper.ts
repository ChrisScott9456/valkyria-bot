import { CommandInteraction, MessagePayload, InteractionReplyOptions } from 'discord.js';

export function replyWrapper(message: string | MessagePayload | InteractionReplyOptions, interaction: CommandInteraction<'cached'>) {
	if (interaction.replied || interaction.deferred) {
		return interaction.followUp(message);
	} else {
		return interaction.reply(message);
	}
}
