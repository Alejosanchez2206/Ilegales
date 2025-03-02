
const agruparRoles = async (roleId, channelId) => {
    try {
        const guild = client.guilds.cache.first();
        const role = guild.roles.cache.get(roleId);
        if (!role) return console.log('Rol no encontrado');

        const membersWithRole = role.members.map(member => member.user.username).sort();

        const channel = guild.channels.cache.get(channelId);
        if (!channel) return console.log('Canal no encontrado');

        const messages = await channel.messages.fetch({ limit: 100 });
        const botMessage = messages.find(msg => msg.author.id === client.user.id);
        if (botMessage) await botMessage.delete();

        const message = membersWithRole.length > 0
            ? `Miembros Oficiales con el rol ${role.name}:\n${membersWithRole.join('\n')}`
            : `No hay miembros Oficiales con el rol ${role.name}.`;

        await channel.send(message);
    } catch (error) {
        console.error('Error al agrupar roles:', error);
    }
};

module.exports = { agruparRoles };

