const {
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
    SlashCommandBuilder,
    Client,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder
} = require('discord.js');


const roboSchema = require('../../Models/robosSolicitados');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('denegar-robo')
        .setDescription('Denegar un robo')
        .addStringOption(option =>
            option.setName('id-robo')
                .setDescription('ID del robo')
                .setRequired(true)
        ),

    async execute(interation, client) {
        try {
            //Verficar que rol tiene el usuario
            const rolesUser = interation.member.roles.cache.map(role => role.id); // Obtener array de roles del usuario
            const validarRol = rolesUser.find(roleId => config.ROLE_ADMIN.includes(roleId)); // Verificar si el usuario tiene al menos uno de los roles de administrador y obtener el id del rol que concuerda

            if (!validarRol) {
                return interation.reply({ content: 'No tienes permisos para ejecutar este comando', ephemeral: true });
            }

            const { options } = interation;

            const idRobo = options.getString('id-robo');

            const robo = await roboSchema.findOne({ idrobo: idRobo });

            if (!robo) {
                return interation.reply({ content: 'No se encontro el robo', ephemeral: true });
            }

            await roboSchema.findOneAndUpdate({ idrobo: idRobo }, { aprobado: false });

            const roleId = robo.organizacion;
            const embed = new EmbedBuilder()
                .setTitle('🔔 **Robo rechazado**')
                .addFields(
                    { name: '🆔 **ID**', value: `\`\`\`cmd\n${idRobo}\n\`\`\`` },
                    { name: '🏴 **Organización**', value: ` <@&${roleId}>` },
                    { name: '📅 **Día**', value: `${robo.fecha}` },
                    { name: '🕒 **Hora**', value: `${robo.hora}` },
                    { name: '🚔 **Robo**', value: `${robo.robo}` },
                    { name: '👥 **Personas**', value: `${robo.personas}` },
                )
                .setColor('#E4080A')

            interation.reply({ embeds: [embed], ephemeral: true });

            const channel = client.channels.cache.get('1290755213959102545');  // Reemplaza con el ID del canal
            const fecha = new Date();
            await channel.send({
                content: ` Robo solicitado por la organización <@&${roleId}>, Ha sido rechazado por **${interation.user.tag}** el ${fecha.toLocaleDateString()}, de la Faccion legal <@&${validarRol}>`,
                embeds: [embed]
            });



        } catch (error) {
            console.log(error);
            return interation.reply({ content: `Ocurrio un error al ejecutar el comando ${interation.commandName}`, ephemeral: true });
        }
    }
}