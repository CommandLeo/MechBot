import {Client, Intents} from 'discord.js';

import {logBan, logDM, logKick, logTimeout, logUnban, logUntimeout} from './loggers.js';
import {checkTempRoles} from './utilities/tempRoles.js';
import {checkReminders} from './utilities/reminders.js';
import {showDeletedMessage} from './utilities/deletedMessages.js';
import {checkStreaming, startedStreaming, stoppedStreaming} from './utilities/streaming.js';
import {handlePollVote, handlePollVoteReceived, handlePollVoteRetracted} from './utilities/polls.js';

import reloadCommands from './reloadCommands.js';
import automod from './automod.js';
import {CONFIG, FAQ, MECHANIST_PATH, readJson} from "./io.js";
import {sqlClient} from "./database.js";

export const MECHANIST_DATA = readJson(MECHANIST_PATH)
const config = readJson(CONFIG)

export const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.DIRECT_MESSAGES],
	partials: ['MESSAGE', 'CHANNEL']
});

client.once('ready', async () => {
	console.log(`${client.user.tag} is online!`);

	client.sequelize = sqlClient;
	Object.values(sqlClient.models).forEach(model => model.sync());

	const guilds = await client.guilds.fetch();
	client.GUILD = await guilds.find(guild => guild.id === config["guild-id"])?.fetch();

	if (!client.GUILD) {
		console.error('Could not find guild!');
		process.exit(1);
	}

	const roles = await client.GUILD.roles.fetch();
	client.ROLES = Object.fromEntries(
		Object
			.entries(MECHANIST_DATA.roles)
			.map(([key, value]) => [key, roles.find(role => role.name.toLowerCase() === value.toLowerCase())])
	);

	const channels = await client.GUILD.channels.fetch();
	client.CHANNELS = Object.fromEntries(
		Object.entries(MECHANIST_DATA.channels).map(
			([key, value]) => [key, channels.find(channel => channel.name.toLowerCase() === value.toLowerCase())]
		)
	);

	reloadCommands(client).catch(console.error);
	checkStreaming(client).catch(console.error);
	checkTempRoles(client).catch(console.error);
	checkReminders(client).catch(console.error);
});

client.on('interactionCreate', async interaction => {
	if (interaction.isCommand() || interaction.isContextMenu()) {
		const command = client.commands?.get(interaction.commandName);
		if (!command) return;
		command.execute(interaction).catch(error => {
			console.error(error);
			const data = {content: 'There was an error while executing this command', ephemeral: true};
			if (interaction.replied || interaction.deferred) {
				interaction.editReply(data);
			} else {
				interaction.reply(data);
			}
		});
	} else if (interaction.isButton()) {
		if (interaction.customId.startsWith('show-deleted-message')) {
			await showDeletedMessage(interaction).catch(console.error);
		} else if (interaction.customId.startsWith('poll-vote')) {
			await handlePollVote(interaction).catch(console.error);
		} else if (interaction.customId.startsWith('poll-retract')) {
			await handlePollVoteRetracted(interaction).catch(console.error);
		}
	} else if (interaction.isSelectMenu()) {
		if (interaction.customId.startsWith('poll-selectoption')) {
			await handlePollVoteReceived(interaction).catch(console.error);
		}
	} else if (interaction.isAutocomplete()) {
		if (interaction.commandName === 'faq') {
			const questions = readJson(FAQ);

			const focusedValue = interaction.options.getFocused();
			await interaction.respond(
				Object.keys(questions)
					.filter(question => question.includes(focusedValue))
					.map(question => ({name: question, value: question}))
			);
		}
	}
});

client.on('messageCreate', message => {
	automod(message).catch(console.error);
	if (message.channel.type === 'DM' && !message.author.bot) {
		logDM(message);
	}
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
	const member = newPresence.member;
	const MEMBER_ROLE = client.ROLES.MEMBER;
	const STREAMING_ROLE = client.ROLES.STREAMING;

	if (!newPresence.user?.bot) return;
	if (newPresence.guild.id !== client.GUILD.id) return;
	if (!member.roles.cache.has(MEMBER_ROLE.id)) return;

	const hasStreamingRole = member.roles.cache.has(STREAMING_ROLE.id);
	const activity = newPresence.activities?.find(activity => activity.type === 'STREAMING');
	if (!hasStreamingRole && activity) {
		startedStreaming(member, activity).catch(console.error);
	} else if (hasStreamingRole && !activity) {
		stoppedStreaming(member).catch(console.error);
	}
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
	if (newMember.guild.id !== client.GUILD.id) return;

	// Timeout handling

	const fetchedLog = await newMember.guild.fetchAuditLogs({
		limit: 1,
		type: 'MEMBER_UPDATE'
	});

	const oldTimeStamp = oldMember.communicationDisabledUntilTimestamp;
	const newTimestamp = newMember.communicationDisabledUntilTimestamp;

	if (!oldTimeStamp && newTimestamp) {
		const log = fetchedLog.entries.first();
		const {executor, target, reason, changes} = log || {};
		if (target.id === newMember.id && changes?.some(change => change.key === 'communication_disabled_until' && !change.old && change.new)) {
			logTimeout(newMember, newTimestamp, executor, reason);
		} else {
			logTimeout(newMember, newTimestamp);
		}
	} else if (oldTimeStamp && !newTimestamp) {
		const log = fetchedLog.entries.first();
		const {executor, target, reason, changes} = log || {};
		if (target.id === newMember.id && changes?.some(change => change.key === 'communication_disabled_until' && change.old && !change.new)) {
			logUntimeout(newMember, executor, reason);
		} else {
			logUntimeout(newMember);
		}
	}

	// Supporter roles handling

	const SUPPORTER_ROLE = client.ROLES.SUPPORTER;
	const SUPPORTER_LVL2_ROLE = client.ROLES.SUPPORTER_LVL2;

	const newHasSupporterRoles = newMember.roles.cache.some(role => MECHANIST_DATA.supporterRoles.includes(role.name));
	const oldHasSupporterRoles = oldMember.roles.cache.some(role => MECHANIST_DATA.supporterRoles.includes(role.name));

	const newHasSupporterLvl2Roles = newMember.roles.cache.some(role => MECHANIST_DATA.supporterLvl2Roles.includes(role.name));
	const oldHasSupporterLvl2Roles = oldMember.roles.cache.some(role => MECHANIST_DATA.supporterLvl2Roles.includes(role.name));

	if (newHasSupporterRoles && !oldHasSupporterRoles) {
		await newMember.roles.add(SUPPORTER_ROLE);
	} else if (!newHasSupporterRoles && oldHasSupporterRoles) {
		await newMember.roles.remove(SUPPORTER_ROLE);
		if (newMember.roles.cache.some(role => role.name.includes('whitelist'))) {
			client.CHANNELS.BOT_SPAM.send({
				content: `${newMember} (id: ${newMember.id}) lost their supporter role. Whitelist needs to be removed`,
				allowedMentions: {parse: []}
			});
		}
	}

	if (newHasSupporterLvl2Roles && !oldHasSupporterLvl2Roles) {
		await newMember.roles.add(SUPPORTER_LVL2_ROLE);
	}
	if (!newHasSupporterLvl2Roles && oldHasSupporterLvl2Roles) {
		await newMember.roles.remove(SUPPORTER_LVL2_ROLE);
		if (newMember.roles.cache.some(role => role.name.includes('whitelist') && role.name.includes('2'))) {
			client.CHANNELS.BOT_SPAM.send({
				content: `${newMember} (id: ${newMember.id}) lost their supporter lvl 2 role. Lvl 2 whitelist needs to be removed`,
				allowedMentions: {parse: []}
			});
		}
	}
});

client.on('guildMemberRemove', async member => {
	if (member.guild.id !== client.GUILD.id) return;

	const roles = member.roles.cache;

	// not needed with Discord timeouts, since they are kept even if the user leaves the guild
	/* 	if (roles.has(client.ROLES.MUTED.id)) {
		const banReason = 'left the server while being muted';
		await member.ban({ banReason }).catch(() => console.warn(`Could not ban ${member.user.tag}`));
		logBan(member, member.guild.me, banReason);
		member.send('You have been banned due to leaving the server while being muted').catch(() => console.warn(`Could not inform ${member.user.tag} about their ban`));
	} */

	if (roles.some(role => role.name.includes('whitelist'))) {
		client.CHANNELS.BOT_SPAM.send({
			content: `${member} (id: ${member.id}) left the server with a whitelist role`,
			allowedMentions: {parse: []}
		});
	}

	// Kick handling

	const fetchedLog = await member.guild.fetchAuditLogs({
		limit: 1,
		type: 'MEMBER_KICK'
	});

	const kickLog = fetchedLog.entries.first();

	if (!kickLog || kickLog.createdAt < member.joinedAt) return console.log(`[LEAVE] ${member.user.tag} (id: ${member.id}) left the server`);

	const {executor, target, reason} = kickLog;

	if (target.id === member.id) {
		logKick(target, executor, reason);
	} else {
		console.log(`[LEAVE] ${member.user.tag} (id: ${member.id}) left the guild, audit log fetch was inconclusive.`);
	}
});

client.on('guildBanAdd', async ban => {
	if (ban.guild.id !== client.GUILD.id) return;

	// Ban handling

	const fetchedLog = await ban.guild.fetchAuditLogs({
		limit: 1,
		type: 'MEMBER_BAN_ADD'
	});

	const banLog = fetchedLog.entries.first();
	const {executor, target, reason} = banLog || {};
	if (target.id === ban.user.id) {
		logBan(ban.user, executor, reason);
	} else {
		logBan(ban.user);
	}
});

client.on('guildBanRemove', async ban => {
	if (ban.guild.id !== client.GUILD.id) return;

	// Unban handling

	const fetchedLog = await ban.guild.fetchAuditLogs({
		limit: 1,
		type: 'MEMBER_BAN_REMOVE'
	});

	const unbanLog = fetchedLog.entries.first();
	const {executor, target, reason} = unbanLog || {};
	if (target.id === ban.user.id) {
		logUnban(ban.user, executor, reason);
	} else {
		logUnban(ban.user);
	}
});

await client.login(process.env.DISCORD_TOKEN);
