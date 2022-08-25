import { ApplicationCommandType } from 'discord.js';

import { client } from '../index.js';

export const command = {
	data: {
		name: 'User Info',
		type: ApplicationCommandType.User
	},
	async execute(interaction) {
		await client.commands.get('userinfo').execute(interaction);
	}
};
