import { ApplicationCommandType } from 'discord.js';

import { client } from '../../index.js';

export const command = {
	data: {
		name: 'deleteemojiservers',
		description: 'Deletes the emoji servers',
		type: ApplicationCommandType.ChatInput
	},
	async execute() {
		const guilds = client.guilds.cache.filter(guild => guild.name === 'Mech Emoji Server');
		guilds.forEach(guild => guild.delete());
	}
};
