import { Formatters } from 'discord.js';
import fs from 'fs/promises';

const botActivities = JSON.parse(await fs.readFile('./activities.json'));

export const command = {
	data: {
		name: 'activity',
		description: 'Manages the activity of the bot',
		options: [
			{
				type: 'SUB_COMMAND',
				name: 'set',
				description: 'Sets the activity',
				options: [{ type: 'INTEGER', name: 'index', description: 'The index', minValue: 1, required: false }]
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

		if (subCommand == 'set') {
			const index = interaction.options.getInteger('index');
			if (index > botActivities.length) return await interaction.reply({ content: 'Invalid index', ephemeral: true });
			const activity = index ? botActivities[index - 1] : botActivities[Math.floor(Math.random() * botActivities.length)];

			await interaction.client.user.setActivity(activity);
			const msg = index ? `Activity ${index} set` : `Random activity set`;
			console.log(`[ACTIVITY] ${msg}`);
			await interaction.reply(msg);
		} else if (subCommand == 'list') {
			await interaction.reply(Formatters.codeBlock(botActivities.map(({ type, name }, i) => `${i + 1}) ${type} | ${name}`).join('\n')));
		} else if (subCommand == 'create') {
			const type = interaction.options.getString('type');
			const name = interaction.options.getString('name');

			botActivities.push({ type, name });
			fs.writeFile('./activities.json', JSON.stringify(botActivities, null, '	')).catch(console.error);
			await interaction.reply('Successfully created activity');
		} else if (subCommand == 'delete') {
			const index = interaction.options.getInteger('index');
			if (index > botActivities.length) return await interaction.reply({ content: 'Invalid index', ephemeral: true });

			botActivities.splice(index - 1, 1);
			fs.writeFile('./activities.json', JSON.stringify(botActivities, null, '	')).catch(console.error);
			await interaction.reply(`Successfully deleted activity ${index}`);
		}
	}
};
