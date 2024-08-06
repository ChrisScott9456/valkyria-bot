import { Command } from '../interfaces/Command';
import { PlayCommand } from './youtube/play';
import { QueueCommand } from './youtube/queue';

export const Commands = new Map<string, Command>();

// Register all commands in the Commands Map
[PlayCommand, QueueCommand].forEach((Command) => {
	const command = new Command();
	Commands.set(command.slashCommandBuilder.name, command);
});
