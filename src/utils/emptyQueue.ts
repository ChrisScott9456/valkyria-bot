import { EmbedBuilder } from 'discord.js';

export function emptyQueue() {
	return {
		embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('**There are no songs in the queue!**')],
	};
}
