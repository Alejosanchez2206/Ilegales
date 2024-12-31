const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChatInputCommandInteraction,
    ChannelType
} = require('discord.js');

const misionesOrg = require('../../Models/misionesOrg');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('misiones-config')
        .setDescription('Configura el canal de anuncios de la organización')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Canal donde se enviara los anuncios')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('rol')
                .setDescription('Rol para los anuncios')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Escribe el nombre de los anuncios')
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(32)
        ),

    /**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {Client} client
     */

    async execute(interaction) {
        try {
            const { options } = interaction
            const channel = options.getChannel('channel')
            const rol = options.getRole('rol')
            const name = options.getString('name')

            const data = await misionesOrg.findOne({ guildId: interaction.guild.id, roleAnuncios: rol.id })

            if (data) {
                await misionesOrg.findOneAndUpdate({ guildId: interaction.guild.id, roleAnuncios: rol.id }, {
                    $set: {
                        canalAnuncios: channel.id,
                        roleAnuncios: rol.id,
                        nameAnuncios: name
                    }
                }, { upsert: true })
                return interaction.reply({ content: 'Misiones actualizado correctamente', ephemeral: true })
            } else {
                const newAnuncios = new misionesOrg({
                    guildId: interaction.guild.id,
                    canalAnuncios: channel.id,
                    roleAnuncios: rol.id,
                    nameAnuncios: name
                })
                await newAnuncios.save()
                return interaction.reply({ content: 'Misiones configurado correctamente', ephemeral: true })
            }
        } catch (error) {
            console.error('Error al configurar los Misiones:', error);
        }
    }
}