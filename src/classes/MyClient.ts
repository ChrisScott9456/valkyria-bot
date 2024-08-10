import { YouTubePlugin } from '@distube/youtube';
import { Client, ClientOptions } from 'discord.js';
import DisTube from 'distube';
import { GUILD_ID } from '..';

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
	}
}
