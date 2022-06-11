// STREAMING

export async function startedStreaming(member, activity) {
	const STREAMING_ROLE = member.client.ROLES.STREAMING;
	const STREAMING_CHANNEL = member.client.CHANNELS.STREAM_ANNOUNCEMENTS;
	
	if (!member.roles.cache.has(STREAMING_ROLE.id)) {
		await member.roles.add(STREAMING_ROLE);
		await STREAMING_CHANNEL.send(`OH WOWIE \n**${member.user.username}** just started streaming ${activity.state}: "${activity.details}\n${activity.url}`);
		console.log(`[STREAMING] ${member.user.tag} (id: ${member.id}) just started streaming`);
	}
}

export async function stoppedStreaming(member) {
	const STREAMING_ROLE = member.client.ROLES.STREAMING;

	if (member.roles.cache.has(STREAMING_ROLE.id)) {
		await member.roles.remove(STREAMING_ROLE);
		console.log(`[STREAMING] ${member.user.tag} (id: ${member.id}) stopped streaming`);
	}
}

export async function checkStreaming(client) {
	const STREAMING_ROLE = client.ROLES.STREAMING;
	STREAMING_ROLE.members.forEach(async member => {
		if (!member.presence.activities.some(activity => activity.type == 'STREAMING')) {
			await member.roles.remove(STREAMING_ROLE);
			console.log(`[STREAMING] Removed Streaming role from ${member.user.tag} (id: ${member.id}) as they are not currently streaming`);
		}
	});
}

// TEMP ROLES

export async function giveTempRole(member, role, duration, reason) {
    const TempRoles = member.client.sequelize.model('temprole');
	await member.roles.add(role, { reason });
	const endDate = Date.now() + duration;
	const temprole = await TempRoles.create({ memberId: member.id, roleId: role.id, endDate });

	setTimeout(() => removeTempRole(member, role, temprole), duration);
}

async function removeTempRole(member, role, temprole) {
	await member.roles.remove(role);
	temprole.destroy();
	console.log(`[TEMP ROLE EXPIRED] Removed role ${role.name} from ${member.user.tag} (id: ${member.id}) as it expired`);
}

export async function checkTempRoles(client) {
    const guild = client.GUILD;
    const TempRoles = client.sequelize.model('temprole');
	const tempRoleList = await TempRoles.findAll();
	await Promise.all(tempRoleList.map(async temprole => {
		const { memberId, roleId, endDate } = temprole;
		const member = await guild.members.fetch(memberId);
		const role = await guild.roles.fetch(roleId);
		setTimeout(() => removeTempRole(member, role, temprole), endDate - Date.now());
	}));
}