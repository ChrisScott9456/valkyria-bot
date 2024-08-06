import { Awaitable, CommandInteraction, ContextMenuCommandBuilder, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import { MyClient } from '../classes/MyClient';

export abstract class Command {
	abstract readonly slashCommandBuilder: SlashCommandBuilder | ContextMenuCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
	abstract run(client: MyClient, interaction: CommandInteraction<'cached'>): Awaitable<any>;
}

export abstract class DisTubeCommand extends Command {
	readonly inVoiceChannel: boolean = true;

	constructor() {
		super();
	}
}
