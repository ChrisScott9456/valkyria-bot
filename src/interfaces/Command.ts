import { Awaitable, CommandInteraction, ContextMenuCommandBuilder, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import { MyClient } from '../classes/MyClient';

export abstract class Command {
	abstract readonly slashCommandBuilder: SlashCommandBuilder | ContextMenuCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
	abstract run(client: MyClient, interaction: CommandInteraction<'cached'>): Awaitable<any>;
}

export enum DisTubeCommand {
	CLEAR = 'CLEAR',
	LOOP = 'LOOP',
	PLAY = 'PLAY',
	PREVIOUS = 'PREVIOUS',
	QUEUE = 'QUEUE',
	SHUFFLE = 'SHUFFLE',
	SKIP = 'SKIP',
	STOP = 'STOP',
}
