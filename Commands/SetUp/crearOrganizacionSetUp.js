const {
    SlashCommandBuilder,
    Client,
    PermissionFlagsBits,
    ChatInputCommandInteraction,
    ChannelType
} = require('discord.js');

const negocioSchema = require('../../Models/crearOrganizacion');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crear-organizacion')
        .setDescription('Crear sistema de organización')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('nombre')
                .setDescription('Escribe el nombre de la organización')
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(32)
        ).addRoleOption(option =>
            option.setName('rol')
                .setDescription('Rol para la organización')
                .setRequired(true)
        ).addStringOption(option =>
            option.setName('crear-categoria')
                .setDescription('¿Desea crear una categoria para la organización?')
                .setRequired(true)
                .addChoices(
                    { name: 'Si', value: 'Si' },
                    { name: 'No', value: 'No' },
                ),
        ),

    /**
     * @param {ChatInputCommandInteraction} interation
     * @param {Client} client 
     */

    async execute(interation, client) {
        const { options } = interation
        const negocioName = options.getString('nombre')
        const rol = options.getRole('rol')
        const Existencia = options.getString('crear-categoria')

        const data = await negocioSchema.findOne({ guildNegocio: interation.guild.id, guildRol: rol.id })

        if (data) {
            await negocioSchema.findOneAndUpdate(
                { guildNegocio: interation.guild.id, guildRol: rol.id },
                { nombreOrganizacion: negocioName }
            )
            return interation.reply({
                content: 'Nombre de organizaciones actualizado correctamente',
                ephemeral: true
            })
        }

        if (Existencia === 'Si') {
            const categoria = await interation.guild.channels.create({
                name: negocioName,
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: interation.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: rol.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                    }
                ]
            })

            const canales = [
                '📜〡ᴍɪꜱɪᴏɴᴇꜱ',
                '👥〡ᴄʜᴀʀʟᴀ',
                '📋〡ᴍɪᴇᴍʙʀᴏꜱ',
                '🏮〡ᴄᴀᴍᴇʟʟᴏꜱ',
                '🛑〡ꜱᴀɴᴄɪᴏɴᴇꜱ'
                
            ]

            canales.forEach(async canal => {
                await interation.guild.channels.create({
                    name: canal,
                    type: ChannelType.GuildText,
                    parent: categoria.id,
                    permissionOverwrites: [
                        {
                            id: interation.guild.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: rol.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                        }
                    ]
                })
            })
        }

        const newNegocio = new negocioSchema({
            guildNegocio: interation.guild.id,
            guildRol: rol.id,
            nombreOrganizacion: negocioName
        })

        await newNegocio.save()

        return interation.reply({ content: 'Organización creada', ephemeral: true })
    }
}