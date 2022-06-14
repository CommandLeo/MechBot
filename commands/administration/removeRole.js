import fs from 'fs/promises';
import { TextInputComponent, Modal, MessageActionRow } from 'discord.js';
import { logRoleRemoved } from '../../loggers.js';

const config = JSON.parse(await fs.readFile('./config.json'));

const textInput = new TextInputComponent({ customId: 'reason', label: 'Reason', style: 'SHORT', required: true });
const row = new MessageActionRow({ components: [textInput] });
const modal = new Modal({ customId: 'reason-modal', title: 'Provide a reason', components: [row] });

export const command = {
	data: {
		name: 'removerole',
		description: 'Removes a role from a user',
		defaultPermission: false,
		options: [
			{ type: 'USER', name: 'member', description: 'The member to remove the role from', required: true },
			{ type: 'ROLE', name: 'role', description: 'The role to remove', required: true },
			{ type: 'STRING', name: 'reason', description: 'The reason for removing the role', required: false }
		]
	},
	async execute(interaction) {
		const role = interaction.options.getRole('role');
		const member = interaction.options.getMember('member');
		let reason = interaction.options.getString('reason');

		if (role.name == '@everyone') return interaction.reply({ content: 'Invalid role', ephemeral: true });
		if (!config.giveableRoles.includes(role.name)) return interaction.reply({ content: 'This is not a giveable role', ephemeral: true });
		if (!member.roles.cache.has(role.id)) return interaction.reply({ content: "The user doesn't have that role", ephemeral: true });

		if (!reason) {
			await interaction.showModal(modal);
			const modalInteraction = await interaction.awaitModalSubmit({ filter: interaction => interaction.customId == 'reason-modal', time: 60 * 1000 }).catch(() => null);
			if (!modalInteraction) return interaction.followUp({ content: "You didn't reply in time", ephemeral: true });
			reason = modalInteraction.fields.getTextInputValue('reason');
			interaction = modalInteraction;
		}

		await member.roles.remove(role);
		logRoleRemoved(interaction.member, member, role, reason);
		await interaction.reply({ content: `Removed role ${role.name} from ${member}`, allowedMentions: { parse: [] } });
	}
};
