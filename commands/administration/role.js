import fs from 'fs/promises';
import { TextInputComponent, Modal, MessageActionRow } from 'discord.js';
import ms from 'ms';
import { giveTempRole } from '../../utilities/tempRoles.js';
import { logRoleGiven, logTempRoleGiven, logRoleRemoved } from '../../loggers.js';

const config = JSON.parse(await fs.readFile('./config.json'));

const textInput = new TextInputComponent({ customId: 'reason', label: 'Reason', style: 'SHORT', required: true });
const row = new MessageActionRow({ components: [textInput] });
const modal = new Modal({ customId: 'reason-modal', title: 'Provide a reason', components: [row] });

export const command = {
	data: {
		name: 'role',
		description: 'Manages the roles of a user',
		defaultPermission: false,
		options: [
			{
				type: 'SUB_COMMAND',
				name: 'give',
				description: 'Gives a role to a user',
				options: [
					{ type: 'USER', name: 'member', description: 'The member to whom to give the role', required: true },
					{ type: 'ROLE', name: 'role', description: 'The role to give', required: true },
					{ type: 'STRING', name: 'reason', description: 'The reason for giving the role', required: false }
				]
			},
			{
				type: 'SUB_COMMAND',
				name: 'give-temp',
				description: 'Temporarily gives a role to a user',
				options: [
					{ type: 'USER', name: 'member', description: 'The member to whom to give the role', required: true },
					{ type: 'ROLE', name: 'role', description: 'The role to give', required: true },
					{ type: 'STRING', name: 'duration', description: 'How long to give the role for', required: true },
					{ type: 'STRING', name: 'reason', description: 'The reason for giving the role', required: false }
				]
			},
			{
				type: 'SUB_COMMAND',
				name: 'remove',
				description: 'Removes a role from a user',
				options: [
					{ type: 'USER', name: 'member', description: 'The member to remove the role from', required: true },
					{ type: 'ROLE', name: 'role', description: 'The role to remove', required: true },
					{ type: 'STRING', name: 'reason', description: 'The reason for removing the role', required: false }
				]
			}
		]
	},
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const role = interaction.options.getRole('role');
		const member = interaction.options.getMember('member');
		let reason = interaction.options.getString('reason');

		if (role.name == '@everyone') return interaction.reply({ content: 'Invalid role', ephemeral: true });
		if (!config.giveableRoles.includes(role.name)) return interaction.reply({ content: 'This is not a giveable role', ephemeral: true });
		if ((subcommand == 'give' || subcommand == 'give_temp') && member.roles.cache.has(role.id)) return interaction.reply({ content: 'The user already has that role', ephemeral: true });
		if (subcommand == 'remove' && !member.roles.cache.has(role.id)) return interaction.reply({ content: "The user doesn't have that role", ephemeral: true });

		if (!reason) {
			await interaction.showModal(modal);
			const modalInteraction = await interaction.awaitModalSubmit({ filter: interaction => interaction.customId == 'reason-modal', time: 60 * 1000 }).catch(() => null);
			if (!modalInteraction) return interaction.followUp({ content: "You didn't reply in time", ephemeral: true });
			reason = modalInteraction.fields.getTextInputValue('reason');
			interaction = modalInteraction;
		}

		if (subcommand == 'give') {
			await member.roles.add(role);
			logRoleGiven(interaction.member, member, role, reason);
			await interaction.reply({ content: `Given role ${role.name} to ${member}`, allowedMentions: { parse: [] } });
		} else if (subcommand == 'give-temp') {
			const duration = ms(interaction.options.getString('duration'));
			await giveTempRole(member, role, duration, reason);
			logTempRoleGiven(interaction.member, member, role, duration, reason);
			await interaction.reply({ content: `Given role ${role.name} to ${member} for ${ms(duration, { long: true })}`, allowedMentions: { parse: [] } });
		} else if (subcommand == 'remove') {
			await member.roles.remove(role);

			const TempRoles = interaction.client.sequelize.model('temproles');
			await TempRoles.destroy({ where: { memberId: member.id, roleId: role.id } });

			logRoleRemoved(interaction.member, member, role, reason);
			await interaction.reply({ content: `Removed role ${role.name} from ${member}`, allowedMentions: { parse: [] } });
		}
	}
};
