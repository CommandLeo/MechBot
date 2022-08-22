import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import ms from 'ms';
import { client } from './index.js';

const COLORS = {
	RED: 0xe74c3c,
	GREEN: 0x2ecc71,
	ORANGE: 0xe67e22,
	BLUE: 0x3498db
};

export function logDM(message) {
	const BOT_SPAM_CHANNEL = client.CHANNELS.BOT_SPAM;

	const embed = new EmbedBuilder({
		title: `📩 DM Received`,
		description: `${message.author} sent a private message:\n${message.content}\n\n${
			message.attachments.size ? `**Attachments**: ${message.attachments.map(attachment => attachment.url).join(', ')}` : ''
		}`,
		footer: { text: `Author: ${message.author.id}` },
		color: COLORS.BLUE,
		timestamp: Date.now()
	});

	BOT_SPAM_CHANNEL.send({ embeds: [embed] });
}

export function logMessageDeleted(message, executor, reason) {
	const LOG_CHANNEL = client.CHANNELS.LOG;

	const embed = new EmbedBuilder({
		title: `🗑 Message Deleted`,
		description: `${executor} deleted the message of ${message.author} in ${message.channel}${reason ? `\n**Reason**: ${reason}` : ''}`,
		footer: { text: `Author: ${message.author.id} | Message ID: ${message.id}` },
		color: COLORS.RED,
		thumbnail: { url: message.member.displayAvatarURL() },
		timestamp: Date.now()
	});
	const button = new ButtonBuilder({ customId: `show-deleted-message-${message.id}`, label: 'Show Message', emoji: '✉', style: ButtonStyle.Secondary });
	const row = new ActionRowBuilder({ components: [button] });

	LOG_CHANNEL.send({ embeds: [embed], components: [row] });
}

export function logRoleGiven(giver, target, role, reason) {
	const LOG_CHANNEL = client.CHANNELS.LOG;

	const embed = new EmbedBuilder({
		title: `Role Given | ${role.name}`,
		description: `${target} has been given the ${role} role by ${giver}${reason ? `\n**Reason**: ${reason}` : ''}`,
		footer: { text: `Target: ${target.id} | Giver: ${giver.id}` },
		color: COLORS.GREEN,
		thumbnail: { url: target.displayAvatarURL() },
		timestamp: Date.now()
	});

	LOG_CHANNEL.send({ embeds: [embed] });
	console.log(`[ROLE GIVEN] ${target.user.tag} (id: ${target.id}) has been given the ${role.name} role by ${giver.user.tag} (id: ${giver.id}). ${reason ? `Reason: ${reason}` : ''}`);
}

export function logTempRoleGiven(giver, target, role, duration, reason) {
	const LOG_CHANNEL = client.CHANNELS.LOG;
	const amount = ms(duration, { long: true });

	const embed = new EmbedBuilder({
		title: `Temp Role Given | ${role.name}`,
		description: `${target} has been given the ${role} role by ${giver} for ${amount}${reason ? `\n**Reason**: ${reason}` : ''}`,
		footer: { text: `Target: ${target.id} | Giver: ${giver.id}` },
		color: COLORS.GREEN,
		thumbnail: { url: target.displayAvatarURL() },
		timestamp: Date.now()
	});

	LOG_CHANNEL.send({ embeds: [embed] });
	console.log(
		`[TEMP ROLE GIVEN] ${target.user.tag} (id: ${target.id}) has been given the ${role.name} role by ${giver.user.tag} (id: ${giver.id}) for ${amount}. ${reason ? `Reason: ${reason}` : ''}`
	);
}

export function logRoleRemoved(remover, target, role, reason) {
	const LOG_CHANNEL = client.CHANNELS.LOG;

	const embed = new EmbedBuilder({
		title: `Role Removed | ${role.name}`,
		description: `${target} has had the ${role} role removed by ${remover}${reason ? `\n**Reason**: ${reason}` : ''}`,
		footer: { text: `Target: ${target.id} | Remover: ${remover.id}` },
		color: COLORS.RED,
		thumbnail: { url: target.displayAvatarURL() },
		timestamp: Date.now()
	});

	LOG_CHANNEL.send({ embeds: [embed] });
	console.log(`[ROLE REMOVED] ${target.user.tag} (id: ${target.id}) has had the ${role.name} role removed by ${remover.user.tag} (id: ${remover.id}). ${reason ? `Reason: ${reason}` : ''}`);
}

export function logMemePrisoner(member) {
	const MEME_PRISONER_ROLE = client.ROLES.MEME_PRISONER;
	const LOG_CHANNEL = client.CHANNELS.LOG;

	const embed = new EmbedBuilder({
		title: `Meme Prisoner`,
		description: `${member} has been given the ${MEME_PRISONER_ROLE} role for 1 day 🤡`,
		footer: { text: `Target: ${member.id}` },
		color: COLORS.ORANGE,
		thumbnail: { url: member.displayAvatarURL() },
		timestamp: Date.now()
	});

	LOG_CHANNEL.send({ embeds: [embed] });
	console.log(`[MEME PRISONER] ${member.user.tag} has been given the Meme Prisoner role for 1 day`);
}

export function logBan(user, executor, reason) {
	const LOG_CHANNEL = client.CHANNELS.LOG;

	const embed = new EmbedBuilder({
		title: `🔨 Ban`,
		description: `${user} has been banned${executor ? ` by ${executor}` : ''}${reason ? `\n**Reason**: ${reason}` : ''}`,
		footer: { text: `Banned User: ${user.id}` },
		color: COLORS.RED,
		thumbnail: { url: user.displayAvatarURL() },
		timestamp: Date.now()
	});

	LOG_CHANNEL.send({ embeds: [embed] });
	console.log(`[BAN] ${user.tag} (id: ${user.id}) has been banned by ${executor.tag} (id: ${executor.id}). ${reason ? `Reason: ${reason}` : ''}`);
}

export function logUnban(user, executor, reason) {
	const LOG_CHANNEL = client.CHANNELS.LOG;

	const embed = new EmbedBuilder({
		title: `🔨 Unban`,
		description: `${user} has been unbanned${executor ? ` by ${executor}` : ''}${reason ? `\n**Reason**: ${reason}` : ''}`,
		footer: { text: `Unbanned User: ${user.id}` },
		color: COLORS.GREEN,
		thumbnail: { url: user.displayAvatarURL() },
		timestamp: Date.now()
	});

	LOG_CHANNEL.send({ embeds: [embed] });
	console.log(`[UNBAN] ${user.tag} (id: ${user.id}) has been unbanned by ${executor.tag} (id: ${executor.id}). ${reason ? `Reason: ${reason}` : ''}`);
}

export function logKick(user, executor, reason) {
	const LOG_CHANNEL = client.CHANNELS.LOG;

	const embed = new EmbedBuilder({
		title: `👢 Kick`,
		description: `${user} has been kicked by ${executor}\n${reason ? `\n**Reason**: ${reason}` : ''}`,
		footer: { text: `Kicked User: ${user.id}` },
		color: COLORS.RED,
		thumbnail: { url: user.displayAvatarURL() },
		timestamp: Date.now()
	});

	LOG_CHANNEL.send({ embeds: [embed] });
	console.log(`[KICK] ${user.tag} (id: ${user.id}) has been kicked by ${executor.tag} (id: ${executor.id}). ${reason ? `Reason: ${reason}` : ''}`);
}

export function logTimeout(member, timestamp, executor, reason) {
	const LOG_CHANNEL = client.CHANNELS.LOG;
	const time = ms(timestamp - Date.now(), { long: true });

	const embed = new EmbedBuilder({
		title: `⌚ Timeout`,
		description: `${member} has been timed out for ${time}${executor ? ` by ${executor}` : ''}${reason ? `\n**Reason**: ${reason}` : ''}`,
		footer: { text: `Timed Out User: ${member.id}` },
		color: COLORS.RED,
		thumbnail: { url: member.displayAvatarURL() },
		timestamp: Date.now()
	});

	LOG_CHANNEL.send({ embeds: [embed] });
	console.log(`[TIMEOUT] ${member.user.tag} (id: ${member.id}) has been timed out for ${time} by ${executor.tag} (id: ${executor.id}). ${reason ? `Reason: ${reason}` : ''}`);
}

export function logUntimeout(member, executor, reason) {
	const LOG_CHANNEL = client.CHANNELS.LOG;

	const embed = new EmbedBuilder({
		title: `⌚ Untimeout`,
		description: `${member} has been untimed out${executor ? ` by ${executor}` : ''}${reason ? `\n**Reason**: ${reason}` : ''}`,
		footer: { text: `Untimed Out User: ${member.id}` },
		color: COLORS.GREEN,
		thumbnail: { url: member.displayAvatarURL() },
		timestamp: Date.now()
	});

	LOG_CHANNEL.send({ embeds: [embed] });
	console.log(`[UNTIMEOUT] ${member.user.tag} (id: ${member.id}) has been untimed out by ${executor.tag} (id: ${executor.id}). ${reason ? `Reason: ${reason}` : ''}`);
}
