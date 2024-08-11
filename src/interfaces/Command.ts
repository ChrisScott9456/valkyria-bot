import { CommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from 'discord.js';
import { MyClient } from '../classes/MyClient';

export abstract class Command {
	abstract readonly slashCommandBuilder: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
	abstract run(client: MyClient, interaction: CommandInteraction<'cached'>): Promise<void>;
	public aliases: string[];
}

export enum DisTubeCommand {
	CLEAR = 'clear',
	LOOP = 'loop',
	PAUSE = 'pause',
	PLAY = 'play',
	PREVIOUS = 'previous',
	QUEUE = 'queue',
	SHUFFLE = 'shuffle',
	SKIP = 'skip',
	STOP = 'stop',
}
