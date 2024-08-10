import { Command } from '../interfaces/Command';
import { PlayCommand } from './youtube/play';
import { QueueCommand } from './youtube/queue';
import { SkipCommand } from './youtube/skip';
import { StopCommand } from './youtube/stop';

export const Commands = new Map<string, Command>();

// Register all commands in the Commands Map
[PlayCommand, QueueCommand, SkipCommand, StopCommand].forEach((Command) => {
	const command = new Command();
	Commands.set(command.slashCommandBuilder.name, command);
});
