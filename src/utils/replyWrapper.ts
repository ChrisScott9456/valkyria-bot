import { CommandInteraction, BaseMessageOptions } from 'discord.js';

export function replyWrapper(message: string | BaseMessageOptions, interaction: CommandInteraction<'cached'>) {
	if (interaction.replied) {
		return interaction.channel.send(message);
	} else {
		return interaction.reply(message);
	}
}
