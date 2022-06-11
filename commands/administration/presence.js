import fs from 'fs';

const { botPresences } = JSON.parse(fs.readFileSync('./config.json'));

export const command = {
	data: {
		name: 'presence',
		description: 'Sets the presence of the bot',
		options: [{ type: 'INTEGER', name: 'index', description: 'The index', minValue: 0, maxValue: botPresences.length - 1, required: false }]
	},
	async execute(interaction) {
		const index = interaction.options.getInteger('index');
		const presence = botPresences[index || Math.floor(Math.random() * botPresences.length)];

		await interaction.client.user.setPresence(presence);
		const msg = index ? `Presence ${index} set` : `Random presence set`;
		console.log(`[PRESENCE] ${msg}`);
		await interaction.reply(msg);
	}
};
