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
const { data } = require('./denegarRobos');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('result-robos')
        .setDescription('Resultado de un robo ,decir el resultado de un robo')
        .addStringOption(option =>
            option.setName('id-robo')
                .setDescription('ID del robo')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('result')
                .setDescription('Quien gano el robo')
                .setRequired(true)
                .addChoices(
                    { name: 'Facciones Legales', value: 'Facciones Legales Legales' },
                    { name: 'Organizaciones ilegales', value: 'Organizaciones ilegales' },
                    { name: 'No hubo ganadores', value: 'No hubo ganadores' }
                )
        ),

    /** 
    * @param {ChatInputCommandInteraction} interation
    * @param {Client} client
    * @returns {Promise<void>}
    *      
    */


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
            const result = options.getString('result');

            const robo = await roboSchema.findOne({ idrobo: idRobo });

            if (!robo) {
                return interation.reply({ content: 'No se encontro el robo', ephemeral: true });
            }


            const date = new Date();
            const dateResultado = new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" });
            console.log(`Fecha y hora en Colombia: ${dateResultado}`);

            await roboSchema.findOneAndUpdate({ idrobo: idRobo }, { resultado: result, fechaResultado: date });

            const embed = new EmbedBuilder()
                .setTitle('🔔 **Resultado de robo**')
                .addFields(
                    { name: '🆔 **ID**', value: `\`\`\`cmd\n${idRobo}\n\`\`\`` },
                    { name: '🏴 **Organización**', value: `<@&${robo.organizacion}>` },
                    { name: '📅 **Día**', value: `${robo.fecha}` },
                    { name: '🕒 **Hora**', value: `${robo.hora}` },
                    { name: '📝 **Robo**', value: `${robo.robo}` },
                    { name: '👥 **Personas**', value: `${robo.personas}` },
                    { name: '📝 **Ganadores**', value: `${robo.resultado}` },
                    { name: '📅 **Fecha del resultado**', value: `${dateResultado}` }
                ).setColor('#00ff00');

            await interation.reply({ embeds: [embed], ephemeral: true });

            const channel = client.channels.cache.get('1294695195551727730');

            await channel.send({
                content: `Este es el resultado del robo ${idRobo} `,
                embeds: [embed]
            });

        } catch (err) {
            console.log(err);
            return interation.reply({ content: `Ocurrio un error al ejecutar el comando ${interation.commandName}`, ephemeral: true });
        }
    }

}