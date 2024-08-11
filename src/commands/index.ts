import { Command } from '../interfaces/Command';
import { PingCommand } from './text/ping';
import { PauseCommand } from './youtube/pause';
import { PlayCommand } from './youtube/play';
import { PreviousCommand } from './youtube/previous';
import { QueueCommand } from './youtube/queue';
import { SkipCommand } from './youtube/skip';
import { StopCommand } from './youtube/stop';

export const Commands = new Map<string, Command>();

// Register all commands in the Commands Map
[PauseCommand, PingCommand, PlayCommand, PreviousCommand, QueueCommand, SkipCommand, StopCommand].forEach((Command) => {
	const command = new Command();
	Commands.set(command.slashCommandBuilder.name, command);

	// If the command has any aliases, add them to the Commands Map
	if (command.aliases) {
		command.aliases.forEach((alias) => {
			const aliasCommand = new Command();

			aliasCommand.slashCommandBuilder.setDescription(`${command.slashCommandBuilder.description} (Alias of /${command.slashCommandBuilder.name})`);
			aliasCommand.slashCommandBuilder.setName(alias);

			Commands.set(alias, aliasCommand);
		});
	}
});
