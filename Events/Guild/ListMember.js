const { EmbedBuilder } = require('discord.js');
const autoMembers = require('../../Models/autoMember');

async function listRoleMembers(member, channel) {
    try {
        // Buscar todos los roles configurados en la base de datos
        const rolesData = await autoMembers.find({ guild: member.guild.id });
        if (rolesData.length === 0) return;

        // Obtener todos los miembros del servidor
        const guildMembers = await member.guild.members.fetch();
        
        // Array para almacenar la información de cada rol
        let rolesSummary = [];

        // Procesar cada rol
        for (const roleData of rolesData) {
            const role = member.guild.roles.cache.get(roleData.guildRol);
            if (!role) continue;

            // Obtener miembros con este rol
            const membersWithRole = guildMembers.filter(m => m.roles.cache.has(role.id));
            
            // Crear mapa para contar ocurrencias de nombres
            const nameCount = new Map();
            membersWithRole.forEach(m => {
                const name = m.nickname || m.user.username;
                nameCount.set(name, (nameCount.get(name) || 0) + 1);
            });

            // Crear lista ordenada de miembros
            const memberList = Array.from(nameCount.entries())
                .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
                .map(([name, count]) => `${name}${count > 1 ? ` (${count})` : ''}`);

            rolesSummary.push({
                name: role.name,
                totalMembers: membersWithRole.size,
                members: memberList,
                roleId: role.id
            });
        }

        // Ordenar roles por cantidad de miembros
        rolesSummary.sort((a, b) => b.totalMembers - a.totalMembers);

        // Eliminar mensajes anteriores del bot
        const messages = await channel.messages.fetch({ limit: 10 });
        const botMessages = messages.filter(msg => 
            msg.author.id === member.client.user.id 
        );
        await Promise.all(botMessages.map(msg => msg.delete()));

        // Crear mensaje del resumen
        let summaryMessage = '**📊 Resumen de Roles**\n\n';
        
        // Agregar estadísticas generales
        const totalMembersInRoles = rolesSummary.reduce((acc, role) => acc + role.totalMembers, 0);
        summaryMessage += `**Estadísticas Generales:**\n`;
        summaryMessage += `• Total de miembros en roles : ${totalMembersInRoles}\n\n`;

        // Agregar información detallada de cada rol
        rolesSummary.forEach((role, index) => {
            summaryMessage += `**${index + 1}. ${role.name}** <@&${role.roleId}>\n`;
            summaryMessage += `├ Miembros: ${role.totalMembers}\n`;
            if (role.members.length > 0) {
                summaryMessage += `└ Lista: ${role.members.join(', ')}\n`;
            } else {
                summaryMessage += `└ Sin miembros\n`;
            }
            summaryMessage += '\n';
        });

        // Dividir y enviar el mensaje si es muy largo
        const chunks = splitIntoChunks(summaryMessage, 1900);
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const isFirstChunk = i === 0;
            const isLastChunk = i === chunks.length - 1;

            let messageContent = '';
            if (isFirstChunk) messageContent += '```\n';
            messageContent += chunk;
            if (isLastChunk) messageContent += '```';

            await channel.send({ content: messageContent });
        }

    } catch (error) {
        console.error('Error al listar miembros por rol:', error);
        await channel.send('Hubo un error al procesar la lista de roles.');
    }
}

function splitIntoChunks(text, maxLength) {
    const chunks = [];
    let currentChunk = '';

    const lines = text.split('\n');
    for (const line of lines) {
        if (currentChunk.length + line.length + 1 > maxLength) {
            chunks.push(currentChunk);
            currentChunk = line;
        } else {
            currentChunk += (currentChunk ? '\n' : '') + line;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
}

// Exportar la función para usarla en el evento
module.exports = {
    name: 'guildMemberUpdate',
    once: false,
    async execute(oldMember, newMember) {
        const channel = newMember.guild.channels.cache.get('1330296094500061380');
        if (!channel) return;

        await listRoleMembers(newMember, channel);
    }
};