import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, time } from 'discord.js';

export const command = {
	data: {
		name: 'userinfo',
		description: 'Provides information about a user',
		type: ApplicationCommandType.ChatInput,
		options: [{ type: ApplicationCommandOptionType.User, name: 'user', description: 'The user to get info about' }]
	},
	async execute(interaction) {
		const member = interaction.targetMember || interaction.options.getMember('user') || interaction.member;

		const creationTime = member.user.createdAt;
		const joinTime = member.joinedAt;
		const roleManager = member.roles;
		const roles = roleManager.cache.filter(role => role.name !== '@everyone').sort((roleA, roleB) => roleB.position - roleA.position);

		const embed = new EmbedBuilder({
			color: roleManager.color.color,
			title: 'User Information',
			thumbnail: { url: member.displayAvatarURL() },
			fields: [
				{ name: 'Username', value: member.user.tag },
				{ name: 'User ID', value: member.id },
				{ name: 'Joined Discord on', value: `${time(creationTime, 'D')}\n(${time(creationTime, 'R')})`, inline: true },
				{ name: 'Joined this server on', value: `${time(joinTime, 'D')}\n(${time(joinTime, 'R')})`, inline: true },
				{ name: `Role${roles.size > 1 ? 's' : ''}`, value: roles.toJSON().join(', ') }
			]
		});

		await interaction.reply({ embeds: [embed] });
	}
};
