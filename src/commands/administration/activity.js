import { Formatters } from 'discord.js';
import { client } from '../../index.js';
import { ACTIVITIES, readJson, writeJson } from '../../io.js';

const BOT_ACTIVITIES = readJson(ACTIVITIES);

export const command = {
	data: {
		name: 'activity',
		description: 'Manages the activity of the bot',
		options: [
			{
				type: 'SUB_COMMAND',
				name: 'set',
				description: 'Sets the activity',
				options: [{ type: 'INTEGER', name: 'index', description: 'The index', minValue: 1 }]
			},
			{ type: 'SUB_COMMAND', name: 'list', description: 'Lists all the activities' },
			{
				type: 'SUB_COMMAND',
				name: 'create',
				description: 'Creates a new activity',
				options: [
					{
						type: 'STRING',
						name: 'type',
						description: 'The type of the activity',
						choices: [
							{ name: 'Playing', value: 'PLAYING' },
							{ name: 'Streaming', value: 'STREAMING' },
							{ name: 'Listening', value: 'LISTENING' },
							{ name: 'Watching', value: 'WATCHING' },
							{ name: 'Competing', value: 'COMPETING' }
						],
						required: true
					},
					{ type: 'STRING', name: 'name', description: 'The name of the activity', required: true }
				]
			},
			{
				type: 'SUB_COMMAND',
				name: 'delete',
				description: 'Deletes an activity',
				options: [{ type: 'INTEGER', name: 'index', description: 'The index', minValue: 1, required: true }]
			}
		]
	},
	async execute(interaction) {
		const subCommand = interaction.options.getSubcommand();

		if (subCommand === 'set') {
			const index = interaction.options.getInteger('index');
			if (index > BOT_ACTIVITIES.length) return await interaction.reply({ content: 'Invalid index!', ephemeral: true });
			const activity = index ? BOT_ACTIVITIES[index - 1] : BOT_ACTIVITIES[Math.floor(Math.random() * BOT_ACTIVITIES.length)];

			client.user.setActivity(activity);
			const msg = index ? `Activity ${index} set` : `Random activity set`;
			console.log(`[ACTIVITY] ${msg}`);
			await interaction.reply(msg);
		} else if (subCommand === 'list') {
			await interaction.reply(Formatters.codeBlock(printActivities()));
		} else if (subCommand === 'create') {
			const type = interaction.options.getString('type');
			const name = interaction.options.getString('name');

			BOT_ACTIVITIES.push({ type, name });
			writeJson(ACTIVITIES, JSON.stringify(BOT_ACTIVITIES, null, '	'));
			await interaction.reply('Successfully created the activity');
		} else if (subCommand === 'delete') {
			const index = interaction.options.getInteger('index');
			if (index > BOT_ACTIVITIES.length) return await interaction.reply({ content: 'Invalid index!', ephemeral: true });

			BOT_ACTIVITIES.splice(index - 1, 1);
			writeJson(ACTIVITIES, JSON.stringify(BOT_ACTIVITIES, null, '	'));
			await interaction.reply(`Successfully deleted activity ${index}`);
		}
	}
};

function printActivities() {
	const maxActivityTypeLength = Math.max(...BOT_ACTIVITIES.map(activity => activity.type.length));
	const activitiesLength = BOT_ACTIVITIES.length.toString().length;

	return BOT_ACTIVITIES.map((activity, i) => {
		return `${(i + 1).toString().padStart(activitiesLength)}) ${activity.type.padEnd(maxActivityTypeLength)} | ${activity.name}`;
	}).join('\n');
}
