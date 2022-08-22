import { TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder, ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';
import ms from 'ms';

import { giveTempRole } from '../../utilities/tempRoles.js';
import { logRoleGiven, logTempRoleGiven, logRoleRemoved } from '../../loggers.js';
import { client, MECHANIST_DATA } from '../../index.js';

const textInput = new TextInputBuilder({ customId: 'reason', label: 'Reason', style: TextInputStyle.Short, required: true });
const row = new ActionRowBuilder({ components: [textInput] });
const modal = new ModalBuilder({ customId: 'reason-modal', title: 'Provide a reason', components: [row] });

export const command = {
	data: {
		name: 'role',
		description: 'Manages the roles of a user',
		type: ApplicationCommandType.ChatInput,
		options: [
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'give',
				description: 'Gives a role to a user',
				options: [
					{ type: ApplicationCommandOptionType.User, name: 'member', description: 'The member to whom to give the role', required: true },
					{ type: ApplicationCommandOptionType.Role, name: 'role', description: 'The role to give', required: true },
					{ type: ApplicationCommandOptionType.String, name: 'reason', description: 'The reason for giving the role' }
				]
			},
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'give-temp',
				description: 'Temporarily gives a role to a user',
				options: [
					{ type: ApplicationCommandOptionType.User, name: 'member', description: 'The member to whom to give the role', required: true },
					{ type: ApplicationCommandOptionType.Role, name: 'role', description: 'The role to give', required: true },
					{ type: ApplicationCommandOptionType.String, name: 'duration', description: 'How long to give the role for', required: true },
					{ type: ApplicationCommandOptionType.String, name: 'reason', description: 'The reason for giving the role' }
				]
			},
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'remove',
				description: 'Removes a role from a user',
				options: [
					{ type: ApplicationCommandOptionType.User, name: 'member', description: 'The member to remove the role from', required: true },
					{ type: ApplicationCommandOptionType.Role, name: 'role', description: 'The role to remove', required: true },
					{ type: ApplicationCommandOptionType.String, name: 'reason', description: 'The reason for removing the role' }
				]
			}
		]
	},
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const role = interaction.options.getRole('role');
		const member = interaction.options.getMember('member');
		let reason = interaction.options.getString('reason');

		if (role.name === '@everyone') return interaction.reply({ content: 'Invalid role', ephemeral: true });
		if (!MECHANIST_DATA.giveableRoles.includes(role.name)) return interaction.reply({ content: 'This is not a giveable role!', ephemeral: true });
		if ((subcommand === 'give' || subcommand === 'give_temp') && member.roles.cache.has(role.id)) return interaction.reply({ content: 'The user already has that role!', ephemeral: true });
		if (subcommand === 'remove' && !member.roles.cache.has(role.id)) return interaction.reply({ content: "The user doesn't have that role!", ephemeral: true });

		if (!reason) {
			await interaction.showModal(modal);
			const modalInteraction = await interaction.awaitModalSubmit({ filter: interaction => interaction.customId === 'reason-modal', time: 60 * 1000 }).catch(() => null);
			if (!modalInteraction) return interaction.followUp({ content: "You didn't reply in time", ephemeral: true });
			reason = modalInteraction.fields.getTextInputValue('reason');
			interaction = modalInteraction;
		}

		if (subcommand === 'give') {
			await member.roles.add(role);

			logRoleGiven(interaction.member, member, role, reason);
			await interaction.reply({ content: `Given role ${role.name} to ${member}`, allowedMentions: { parse: [] } });
		} else if (subcommand === 'give-temp') {
			const duration = ms(interaction.options.getString('duration'));
			await giveTempRole(member, role, duration, reason);

			logTempRoleGiven(interaction.member, member, role, duration, reason);
			await interaction.reply({ content: `Given role ${role.name} to ${member} for ${ms(duration, { long: true })}`, allowedMentions: { parse: [] } });
		} else if (subcommand === 'remove') {
			await member.roles.remove(role);

			const TempRoles = client.sequelize.model('temproles');
			await TempRoles.destroy({ where: { memberId: member.id, roleId: role.id } });

			logRoleRemoved(interaction.member, member, role, reason);
			await interaction.reply({ content: `Removed role ${role.name} from ${member}`, allowedMentions: { parse: [] } });
		}
	}
};
