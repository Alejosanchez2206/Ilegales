const {
    SlashCommandBuilder,
    Client,
    PermissionFlagsBits,
    ChatInputCommandInteraction,
    ChannelType,
    PermissionsBitField,
    EmbedBuilder
} = require('discord.js');

const roboSchema = require('../../Models/robosSolicitados');
const { generarId } = require('../../utils/idunique');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('solicitar-robov2')
        .setDescription('Solicitar un robo a la facciones legales')
        .addRoleOption(option =>
            option.setName('organizacion')
                .setDescription('Organización que solicita el robo')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('dia')
                .setDescription('Dia del robo EJ : (01/01/2022)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('hora')
                .setDescription('Hora del robo EJ : (13:00:00)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('robo')
                .setDescription('Robo solicitado')
                .setRequired(true)
        )
        .addNumberOption(option =>
            option.setName('numero-personas')
                .setDescription('Numero de personas que participaron en el robo')
                .setRequired(true)
        ),

    /**
      * @param {ChatInputCommandInteraction} interation
      * @param {Client} client 
    */

    async execute(interation, client) {
        try {
            const { options } = interation;
            const organizacion = options.getRole('organizacion');
            const fecha = options.getString('dia');
            const hora = options.getString('hora');
            const robo = options.getString('robo');
            const personas = options.getNumber('numero-personas');
            const idRobo = generarId();

            // Crear el nuevo registro
            const nuevoRobo = new roboSchema({
                guild: interation.guild.id,
                idrobo: idRobo,
                user: interation.user.id,
                organizacion: organizacion.id,
                fecha: fecha,
                hora: hora,
                robo: robo,
                personas: personas,
                aprobado: false
            });
            await nuevoRobo.save();

            const embed = new EmbedBuilder()
                .setTitle('🔔 **Nuevo robo solicitado**')
                .addFields(
                    { name: '🆔 **ID**', value: `\`\`\`cmd\n${idRobo}\n\`\`\`` },
                    { name: '🏴 **Organización**', value: `${organizacion}` },
                    { name: '📅 **Día**', value: `${fecha}` },
                    { name: '🕒 **Hora**', value: `${hora}` },
                    { name: '💰 **Robo Planeado**', value: `${robo}` },
                    { name: '👥 **Cantidad de Personas**', value: `${personas}` }
                )
                .setFooter({ text: 'Complex Community • Todos los derechos reservados.' })
                .setColor('#FFC300');

            // Suponiendo que tienes el ID del rol guardado en una variable 'roleId'
            const roleId = organizacion.id;

            // Enviar el mensaje inicial con los botones
            await interation.reply({
                content: `🔔 Robo solicitado por ${interation.user.username} de la organización <@&${roleId}>`,
                embeds: [embed]
            });

            // También enviar en el canal correspondiente
            const channel = client.channels.cache.get('1290730371670868039');  // Reemplaza con el ID del canal
            await channel.send({
                content: `🔔 Robo solicitado por ${interation.user.username} de la organización <@&${roleId}> , ||@everyone||`,
                embeds: [embed] // Añadir los botones al mensaje en el canal
            });

        } catch (error) {
            console.log(error)
            interation.reply({ content: `Ocurrio un error al ejecutar el comando ${interation.commandName}`, ephemeral: true });
        }
    }

}