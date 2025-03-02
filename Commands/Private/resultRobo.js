const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const roboSchema = require('../../Models/robosSolicitados');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('result-robos')
        .setDescription('Resultado de un robo - Actualiza el resultado de un robo')
        .addStringOption(option =>
            option.setName('id-robo')
                .setDescription('ID del robo')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('result')
                .setDescription('Quién ganó el robo')
                .setRequired(true)
                .addChoices(
                    { name: 'Facciones Legales', value: 'Facciones Legales' },
                    { name: 'Organizaciones ilegales', value: 'Organizaciones ilegales' },
                    { name: 'No hubo ganadores', value: 'No hubo ganadores' }
                )
        ),

    async execute(interaction, client) {
        try {
            // Verificación de roles
            const rolesUser = interaction.member.roles.cache;
            const tienePermiso = config.ROLE_ADMIN.some(roleId => rolesUser.has(roleId));

            if (!tienePermiso) {
                return interaction.reply({
                    content: '⛔ No tienes permisos para este comando',
                    ephemeral: true
                });
            }

            // Obtener parámetros
            const idRobo = interaction.options.getString('id-robo');
            const result = interaction.options.getString('result');

            // Buscar en la base de datos
            const robo = await roboSchema.findOne({ idrobo: idRobo });
            if (!robo) {
                return interaction.reply({
                    content: '❌ No se encontró el robo especificado',
                    ephemeral: true
                });
            }

            // Actualizar registro
            const fechaResultado = new Date().toLocaleString("es-CO", {
                timeZone: "America/Bogota",
                dateStyle: 'full',
                timeStyle: 'short'
            });

            await roboSchema.updateOne(
                { idrobo: idRobo },
                {
                    resultado: result,
                    fechaResultado: new Date()
                }
            );

            // Crear embed
            const embed = new EmbedBuilder()
                .setTitle('🎯 Resultado de Robo')
                .setColor('#2ecc71')
                .addFields(
                    { name: '🆔 ID del Robo', value: `\`${idRobo}\``, inline : false },
                    { name: '🏴 Organización', value: `<@&${robo.organizacion}>`, inline: false },
                    { name: '📅 Fecha Original', value: robo.fecha, inline: false },
                    { name: '🕒 Hora', value: robo.hora, inline: false },
                    { name: '📝 Tipo de Robo', value: robo.robo, inline: false },
                    { name: '👥 Participantes', value: robo.personas.toString(), inline: false },
                    { name: '🏆 Resultado', value: `**${result}**`, inline: false },
                    { name: '📅 Fecha de Resultado', value: fechaResultado, inline: false }
                );

            // Responder al usuario
            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });

            // Enviar a canal de registros
            const logChannel = client.channels.cache.get('1294695195551727730'); // Usar ID desde config
            if (logChannel?.isTextBased()) {
                await logChannel.send({
                    embeds: [embed]
                });
            }

        } catch (error) {
            console.error('Error en comando result-robos:', error);
            interaction.reply({
                content: '⚠️ Error crítico al procesar la solicitud',
                ephemeral: true
            }).catch(console.error);
        }
    }
};