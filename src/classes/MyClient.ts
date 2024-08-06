import { YouTubePlugin } from '@distube/youtube';
import { Client, ClientOptions } from 'discord.js';
import DisTube from 'distube';

export class MyClient extends Client {
	distube = new DisTube(this, {
		plugins: [new YouTubePlugin()],
	});

	constructor(options: ClientOptions) {
		super(options);
	}
}
