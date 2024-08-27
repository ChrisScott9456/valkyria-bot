import { EmbedBuilder, GuildScheduledEventCreateOptions, GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel, Message, PollLayoutType, TextChannel } from 'discord.js';
import { client } from '..';
import moment from 'moment';
import { CronJob } from 'cron';

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { Movie, MovieNightConfig } from '../interfaces/MovieNight';
import { MOVIE_NIGHT_ROLE, MOVIE_NIGHT_TEXT_CHANNEL, MOVIE_NIGHT_VOICE_CHANNEL } from '../lib/envVariables';
import { db, DB_TABLES } from '../lib/knex';

// Load and parse the YAML file
const fileContents = fs.readFileSync('config/movienight.yaml', 'utf8');
const config: MovieNightConfig = yaml.load(fileContents);

const timestamp = () => moment().startOf('week').day(config.dayOfWeek).hour(config.hour);

const timestampFormatted = (format = 'LLLL') => {
	return `${timestamp().format(format)} EST`;
};

const getChannel = async () => (await client.channels.fetch(MOVIE_NIGHT_TEXT_CHANNEL)) as TextChannel;

let lastPoll: Message;

// const now = new Date(); //! Testing

export const createPollJob = new CronJob(
	`0 ${config.hour} * * ${config.dayOfWeek - 1}`, // Create poll 24hrs before movie night time
	// new Date(now.getTime() + 3 * 1000), //! Testing
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
	// new Date(now.getTime() + 20 * 1000), //! Testing
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

			const movies = await db<Movie>(DB_TABLES.MOVIE_LIST).select('*');

			let selectedMovie: Movie; // The random movie to be selected from the list

			if (movies.length > 0) {
				const randomIndex = Math.floor(Math.random() * movies.length);
				selectedMovie = movies[randomIndex];
			}

			const event: GuildScheduledEventCreateOptions = {
				name: `Movie Night - ${timestampFormatted('ll')}`,
				scheduledStartTime: timestamp().toISOString(),
				scheduledEndTime: timestamp().add(3, 'hours').toISOString(),
				privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
				entityType: GuildScheduledEventEntityType.Voice,
				description: [
					`### **Tonight's Movie:**\n **${selectedMovie.Title} (${selectedMovie['Release Date'].slice(0, 4)})**`,
					`### **User:**\n <@${selectedMovie.User}>`,
					`### **Runtime:**\n ${selectedMovie.Runtime}`,
					`### **Synopsis:**\n ${selectedMovie.Synopsis}`,
					`### **IMDB Link:**\n ${selectedMovie['IMDB Link']}`,
					`### **TMDB Link:**\n ${selectedMovie['TMDB Link']}`,
				].join('\n'),
				channel: MOVIE_NIGHT_VOICE_CHANNEL,
				image: selectedMovie.Poster,
			};

			const createdEvent = await channel.guild.scheduledEvents.create(event);
			channel.send(createdEvent.url);

			await db<Movie>(DB_TABLES.MOVIE_LIST).where({ id: selectedMovie.id }).delete();
		}
	},
	null,
	false,
	'America/New_York'
);
