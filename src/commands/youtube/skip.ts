import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { MyClient } from '../../classes/MyClient';
import { replyWrapper } from '../../utils/replyWrapper';
import { emptyQueue } from '../../utils/emptyQueue';

export class SkipCommand extends Command {
	public aliases: string[] = ['next'];
	readonly slashCommandBuilder = new SlashCommandBuilder().setName('skip').setDescription('Skip the current song');

	async run(client: MyClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const queue = client.distube.getQueue(interaction);
		if (!queue) return replyWrapper(emptyQueue(), interaction);

		const song = client.distube.getQueue(interaction).songs[0];

		try {
			let title = 'Skipped';

			// If the current song is the last in the queue, stop playing
			// Otherwise, skip song
			if (!client.distube.getQueue(interaction).songs[1]) {
				await client.distube.stop(interaction);
				title = 'Stopped';
			} else {
				await client.distube.skip(interaction);
			}

			replyWrapper(
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
		} catch (e) {
			console.error(e);
		}
	}
}
