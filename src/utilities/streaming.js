import { ActivityType } from 'discord.js';

import { client } from '../index.js';

export async function startedStreaming(member, activity) {
	const STREAMING_ROLE = client.ROLES.STREAMING;
	const STREAMING_CHANNEL = client.CHANNELS.STREAM_ANNOUNCEMENTS;

	if (!member.roles.cache.has(STREAMING_ROLE.id)) {
		await member.roles.add(STREAMING_ROLE);
		await STREAMING_CHANNEL.send(`OH WOWIE \n**${member.user.username}** just started streaming ${activity.state}: "${activity.details}\n${activity.url}`);
		console.log(`[STREAMING] ${member.user.tag} (id: ${member.id}) just started streaming`);
	}
}

export async function stoppedStreaming(member) {
	const STREAMING_ROLE = client.ROLES.STREAMING;

	if (member.roles.cache.has(STREAMING_ROLE.id)) {
		await member.roles.remove(STREAMING_ROLE);
		console.log(`[STREAMING] ${member.user.tag} (id: ${member.id}) stopped streaming`);
	}
}

export async function checkStreaming(client) {
	const STREAMING_ROLE = client.ROLES.STREAMING;
	STREAMING_ROLE.members.forEach(async member => {
		if (!member.presence.activities.some(activity => activity.type === ActivityType.Streaming)) {
			await member.roles.remove(STREAMING_ROLE);
			console.log(`[STREAMING] Removed Streaming role from ${member.user.tag} (id: ${member.id}) as they are not currently streaming`);
		}
	});
}
