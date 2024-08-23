import { EmbedBuilder, GuildScheduledEventCreateOptions, GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel, Message, PollLayoutType, TextChannel } from 'discord.js';
import { client } from '..';
import moment from 'moment';
import { CronJob } from 'cron';

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { MovieNightConfig } from '../interfaces/MovieNightConfig';
import { MOVIE_NIGHT_ROLE, MOVIE_NIGHT_TEXT_CHANNEL, MOVIE_NIGHT_VOICE_CHANNEL } from '../lib/envVariables';

// Load and parse the YAML file
const fileContents = fs.readFileSync('config/movienight.yaml', 'utf8');
const config: MovieNightConfig = yaml.load(fileContents);

const timestamp = () => moment().startOf('week').day(config.dayOfWeek).hour(config.hour);

const timestampFormatted = (format = 'LLLL') => {
	return `${timestamp().format(format)} EST`;
};

const getChannel = async () => (await client.channels.fetch(MOVIE_NIGHT_TEXT_CHANNEL)) as TextChannel;

let lastPoll: Message;

export const createPollJob = new CronJob(
	`0 ${config.hour} * * ${config.dayOfWeek - 1}`, // Create poll 24hrs before movie night time
	async () => {
		const channel = await getChannel();
		await channel.send(`<@&${MOVIE_NIGHT_ROLE}>`);

		lastPoll = await channel.send({
			poll: {
				question: { text: `Will you attend Movie Night? - ${timestampFormatted('llll')}` },
				answers: [
					{ text: 'Yes', emoji: '✅' },
					{ text: 'No', emoji: '❌' },
				],
				allowMultiselect: false,
				duration: config.pollLength,
				layoutType: PollLayoutType.Default,
			},
		});
	},
	null,
	false,
	'America/New_York'
);

const endPollTime = config.hour + config.pollLength;

export const endPollJob = new CronJob(
	`1 ${endPollTime > 23 ? endPollTime - 24 : endPollTime} * * ${config.dayOfWeek}`, // Check results 1 minute after poll ends (config.pollLength hours after start)
	async () => {
		const channel = await getChannel();
		await lastPoll.poll.end();

		const answers = Array.from(lastPoll.poll.answers.values());
		const totalVotes = answers[0].voteCount + answers[1].voteCount;

		if (totalVotes < config.requiredVotes) {
			await channel.send(`<@&${MOVIE_NIGHT_ROLE}>`);
			await channel.send({
				embeds: [new EmbedBuilder().setColor('Red').setTitle('Movie Night').setDescription(`There weren't enough votes!`)],
			});
			return;
		}

		const failure = answers[1].voteCount > config.failureVotes; // If number of "No" votes exceeds failureVote limit, cancel movie night

		if (failure) {
			await channel.send(`<@&${MOVIE_NIGHT_ROLE}>`);
			await channel.send({
				embeds: [
					new EmbedBuilder()
						.setColor('Red')
						.setTitle('Movie Night Cancelled!')
						.setDescription(`Not enough "Yes" votes for Movie Night - ${timestampFormatted('ll')}`),
				],
			});
		} else {
			await channel.send(`<@&${MOVIE_NIGHT_ROLE}>`);

			const title = 'SOME TITLE';

			const event: GuildScheduledEventCreateOptions = {
				name: `Movie Night - ${timestampFormatted('ll')}`,
				scheduledStartTime: timestamp().toISOString(),
				scheduledEndTime: timestamp().add(3, 'hours').toISOString(),
				privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
				entityType: GuildScheduledEventEntityType.Voice,
				description: `Tonight's movie is: ${title}`,
				channel: MOVIE_NIGHT_VOICE_CHANNEL,
			};

			const createdEvent = await channel.guild.scheduledEvents.create(event);
			channel.send(createdEvent.url);
		}
	},
	null,
	false,
	'America/New_York'
);
