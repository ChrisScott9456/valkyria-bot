import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DisTubeCommand } from '../../interfaces/Command';
import { MyClient } from '../../classes/MyClient';

export class StopCommand extends DisTubeCommand {
	readonly slashCommandBuilder = new SlashCommandBuilder().setName('stop').setDescription('Stops playing');

	async run(client: MyClient, interaction: ChatInputCommandInteraction<'cached'>) {
		try {
			await client.distube.stop(interaction);
			interaction.reply({
				embeds: [new EmbedBuilder().setColor('Blurple').setTitle('DisTube').setDescription('Stopped!')],
			});
		} catch (e) {
			console.error(e);
			interaction.reply({
				embeds: [new EmbedBuilder().setColor('Blurple').setTitle('DisTube').setDescription(`Error: \`${e}\``)],
			});
		}
	}
}
