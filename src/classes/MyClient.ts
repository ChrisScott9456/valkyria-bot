import { YouTubePlugin } from '@distube/youtube';
import { Client, ClientOptions } from 'discord.js';
import DisTube from 'distube';
import { DISCORD_TOKEN } from '..';
import { Config } from '../interfaces/Config';

import * as fs from 'fs';
import * as yaml from 'js-yaml';

// Load and parse the YAML file
const fileContents = fs.readFileSync('config.yaml', 'utf8');
const config: Config = yaml.load(fileContents);

export class MyClient extends Client {
	distube = new DisTube(this, {
		plugins: [
			new YouTubePlugin({
				cookies: [
					{
						domain: '.youtube.com',
						expirationDate: 1234567890,
						hostOnly: false,
						httpOnly: true,
						name: 'XXX',
						path: '/',
						sameSite: 'no_restriction',
						secure: true,
						value: '---xxx---',
					},
				],
			}),
		],
	});

	constructor(options: ClientOptions) {
		super(options);

		this.initialize();
	}

	async initialize() {
		await this.login(DISCORD_TOKEN);

		this.user.setPresence(config.richPresence);
	}
}
