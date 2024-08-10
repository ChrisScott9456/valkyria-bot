import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DisTubeCommand } from '../../interfaces/Command';
import { MyClient } from '../../classes/MyClient';
import { Commands } from '..';
import { Song } from 'distube';

export class SkipCommand extends DisTubeCommand {
	readonly slashCommandBuilder = new SlashCommandBuilder().setName('skip').setDescription('Skip the current song');

	async run(client: MyClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const song = client.distube.getQueue(interaction).songs[0];

		try {
			await client.distube.skip(interaction);
			interaction.reply(buildReply(song));
		} catch (e) {
			// If there is no remaining song in the queue, stop playing
			if ((e as Error).stack.includes('NO_UP_NEXT')) {
				try {
					await client.distube.stop(interaction);
					interaction.reply(buildReply(song));
				} catch (e) {
					console.error(e);
				}
			} else {
				console.error(e);
			}
		}
	}
}

function buildReply(song: Song) {
	return {
		embeds: [new EmbedBuilder().setColor('Blurple').setTitle('DisTube').setDescription(`Skipped the current song - **${song}**`)],
	};
}
