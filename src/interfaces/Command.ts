import { Awaitable, CommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from 'discord.js';
import { MyClient } from '../classes/MyClient';

export abstract class Command {
	abstract readonly slashCommandBuilder: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
	abstract run(client: MyClient, interaction: CommandInteraction<'cached'>): Awaitable<any>;
	public aliases: string[];
}

export enum DisTubeCommand {
	CLEAR = 'clear',
	LOOP = 'loop',
	PLAY = 'play',
	PREVIOUS = 'previous',
	QUEUE = 'queue',
	SHUFFLE = 'shuffle',
	SKIP = 'skip',
	STOP = 'stop',
}
