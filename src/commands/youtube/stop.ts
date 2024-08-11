import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { MyClient } from '../../classes/MyClient';
import { replyWrapper } from '../../utils/replyWrapper';
import { emptyQueue } from '../../utils/emptyQueue';

export class StopCommand extends Command {
	public aliases: string[] = ['clear'];
	readonly slashCommandBuilder = new SlashCommandBuilder().setName('stop').setDescription('Stops playing');

	async run(client: MyClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const queue = client.distube.getQueue(interaction);
		if (!queue) return replyWrapper(emptyQueue(), interaction);

		const song = client.distube.getQueue(interaction).songs[0];

		try {
			await client.distube.stop(interaction);
			replyWrapper(
				{
					embeds: [
						new EmbedBuilder()
							.setColor('Blurple')
							.setTitle('Stopped')
							.setDescription(`**[${song.name || song.url}](${song.url})**\n`),
					],
				},
				interaction
			);
		} catch (e) {
			console.error(e);
		}
	}
}
