import { MessagePayload, GuildTextBasedChannel, BaseMessageOptions, ButtonInteraction, ChatInputCommandInteraction } from 'discord.js';
import { EmbedError, EmbedErrorMessages } from './errorEmbed';

export function replyWrapper({
	message,
	interaction,
	channel,
}: {
	message: string | MessagePayload | BaseMessageOptions;
	interaction?: ChatInputCommandInteraction | ButtonInteraction;
	channel?: GuildTextBasedChannel;
}) {
	if (interaction) {
		if (interaction.replied || interaction.deferred) {
			return interaction.followUp(message);
		} else {
			return interaction.reply(message);
		}
	} else if (channel) {
		return channel.send(message);
	} else {
		throw new EmbedError(EmbedErrorMessages.GENERAL_ERROR);
	}
}
