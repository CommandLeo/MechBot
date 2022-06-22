import { MessageEmbed } from 'discord.js';
import { client } from '../index.js';

export const command = {
	data: {
		name: 'listrole',
		description: 'Lists users that have a certain role',
		options: [{ type: 'ROLE', name: 'role', description: 'The role of which to list the users', required: true }]
	},
	async execute(interaction) {
		const role = interaction.options.getRole('role');
		if (role.name === '@everyone') return interaction.reply({ content: 'Invalid role', ephemeral: true });
		const members = role.members.sort((member1, member2) => member1.user.username.localeCompare(member2.user.username));
		const data = members.map(member => ({ name: member.user.tag, value: member.toString(), inline: true }));
		if (data.length > 0) {
			const mechEmoji = client.emojis.cache.find(emoji => emoji.name === 'mechanistsSpin');
			const embedsAmount = Math.ceil(data.length / 24);
			const elementsAmount = Math.ceil(data.length / embedsAmount / 3) * 3;
			const chunks = Array.from({ length: Math.min(10, embedsAmount) }, (_, i) => data.slice(elementsAmount * i, elementsAmount * (i + 1)));
			const embeds = chunks.map((fields, i) => {
				const embed = new MessageEmbed({ color: '#3498db', fields });
				if (i === 0) embed.setTitle(`${mechEmoji} ${data.length} user${data.length > 1 ? 's' : ''} with role '${role.name}'`);
				return embed;
			});
			await interaction.reply({ embeds });
		} else {
			await interaction.reply('There are no users with that role!');
		}
	}
};
