import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, time } from 'discord.js';

export const command = {
	data: {
		name: 'userinfo',
		description: 'Provides information about a user',
		type: ApplicationCommandType.ChatInput,
		options: [{ type: ApplicationCommandOptionType.User, name: 'user', description: 'The user to get info about' }]
	},
	async execute(interaction) {
		const targetMember = interaction.targetMember || interaction.options.getMember('user');
		const targetUser = interaction.options.getUser('user');

		if (targetUser && !targetMember) {
			const avatar = targetUser.displayAvatarURL({ extension: 'png' });
			const userTag = targetUser.tag;
			const userId = targetUser.id;
			const creationTime = targetUser.createdAt;

			const embed = new EmbedBuilder({
				title: 'User Information',
				thumbnail: { url: avatar },
				fields: [
					{ name: 'Username', value: userTag },
					{ name: 'User ID', value: userId },
					{ name: 'Joined Discord on', value: `${time(creationTime, 'D')}\n(${time(creationTime, 'R')})` }
				]
			});

			await interaction.reply({ embeds: [embed] });
		} else {
			const member = targetMember || interaction.member;

			const avatar = member.displayAvatarURL({ extension: 'png' });
			const userTag = member.user.tag;
			const userId = member.user.id;
			const creationTime = member.user.createdAt;
			const joinTime = member.joinedAt;
			const roleManager = member.roles;
			const roles = roleManager.cache.filter(role => role.name !== '@everyone').reverse();

			const embed = new EmbedBuilder({
				color: roleManager.color?.color,
				title: 'User Information',
				thumbnail: { url: avatar },
				fields: [
					{ name: 'Username', value: userTag },
					{ name: 'User ID', value: userId },
					{ name: 'Joined Discord on', value: `${time(creationTime, 'D')}\n(${time(creationTime, 'R')})`, inline: true },
					{ name: 'Joined this server on', value: `${time(joinTime, 'D')}\n(${time(joinTime, 'R')})`, inline: true },
					{ name: 'Roles', value: roles.toJSON().join(', ') || 'None' }
				]
			});

			await interaction.reply({ embeds: [embed] });
		}
	}
};
