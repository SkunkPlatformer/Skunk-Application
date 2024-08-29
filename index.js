const { Client, GatewayIntentBits, Events, TextInputStyle, ModalBuilder, AuditLogEvent, TextInputBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Message, SelectMenuBuilder, ButtonBuilder, Partials, ButtonStyle, ActionRowBuilder, MessageAttachment, InteractionType, PermissionsBitField, Guild, Collection, Attachment, AttachmentBuilder, PermissionFlagsBits, MessageEmbed, ButtonInteraction, EmbedBuilder, ChannelType, ThreadAutoArchiveDuration, GuildAuditLogs } = require('discord.js');
const axios = require('axios');
const config = require('./config.json');
const { registerCommands } = require('./handlerCommands');
const { parseDuration } = require('./utils');
const ms = require('ms');
const path = require('path');
const sendhook = require("./sendhook");
const fs = require("fs");
const { readUserDatas, writeUserDatas } = require('./userdatas');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User, Partials.Reaction]
});
const { exec } = require('child_process');

const apiKey = 'acc_23944d2f121eb28';
const apiSecret = '163338472c4bc8cc12323fed7f20149c';
const witToken = 'QXZYQCZVHGDTXIGZLDAIIFIOQYBLAGJA';

const allowedUserIds = ['1208633283907158030', '1025405681714610187', '1178697450681270282'];

const guildWelcomeCustom = new Map();
const guildLeaveCustom = new Map();

const verificationCodes = new Map();

client.on('guildMemberAdd', async (member) => {
  const customWelcome = guildWelcomeCustom.get(member.guild.id);
  console.log('Custom welcome data:', customWelcome); // Debug log

  if (customWelcome) {
    const welcomeChannel = member.guild.channels.cache.get(customWelcome.channelId);
    console.log('Welcome channel:', welcomeChannel); // Debug log

    if (welcomeChannel) {
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Welcome!')
        .setDescription(customWelcome.welcomeText.replace('{user}', member.user.tag))
        .setTimestamp()
        .setFooter({ text: 'Enjoy your stay!' })
        .setImage('https://icons.veryicon.com/png/o/miscellaneous/travel-flat-colorful-icon/welcome-2.png');

      try {
        await welcomeChannel.send({ embeds: [embed] });
        console.log('Welcome message sent'); // Debug log
      } catch (error) {
        console.error('Error sending welcome message:', error); // Error log
      }
    } else {
      console.error('Welcome channel not found'); // Error log
    }
  }
});

client.on('guildMemberRemove', async (member) => {
  const customLeave = guildLeaveCustom.get(member.guild.id);
  console.log('Custom leave data:', customLeave); // Debug log

  if (customLeave) {
    const leaveChannel = member.guild.channels.cache.get(customLeave.channelId);
    console.log('Leave channel:', leaveChannel); // Debug log

    if (leaveChannel) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Goodbye!')
        .setDescription(customLeave.leaveText.replace('{user}', member.user.tag))
        .setTimestamp()
        .setImage("https://media.istockphoto.com/id/1453046767/vector/speech-banner-and-blue-shade-with-word-goodbye-on-white-background.jpg?s=612x612&w=0&k=20&c=wGwOvFP2H497m8URNlJ4IGd5C_weMI-MP9J4vC23BuM=")
        .setFooter({ text: 'We hope to see you again!' });

      try {
        await leaveChannel.send({ embeds: [embed] });
        console.log('Leave message sent'); // Debug log
      } catch (error) {
        console.error('Error sending leave message:', error); // Error log
      }
    } else {
      console.error('Leave channel not found'); // Error log
    }
  }
});

client.on('reconnecting', async () => {
  console.log(null);
});

client.on('error', async (error) => {
  logErrorToFile(error);
  console.log(error);
  client.user.setStatus("idle");
  client.user.setActivity("Something went error.", { type: 4 });

  setTimeout(() => {
    client.user.setStatus("online");
    client.user.setActivity("", { type: 4 });
  }, 100000);
});

client.on('disconnect', async (event) => {
  try {
    const fetchedGuild = await client.guilds.fetch('1257939495970410498');
    // Fetch the channels within the guild
    const channel = await fetchedGuild.channels.fetch('1264296512792428575');

    // Send a message to the channel
    await channel.send(`Bot and Application Disconnected`);
    console.log(`Mensaje enviado al canal: ${channel.name} en el servidor: ${fetchedGuild.name}`);
  } catch (error) {
    console.error('Error al obtener el servidor o el canal:', error);
  }
});

const denyGuildId = [1268074348351324172];

client.on('guildCreate', async (guild) => {
  console.log(`Joined a new guild: ${guild.name} (ID: ${guild.id})`);
  console.log(`Adding Commands for ${guild.name}`);

  guild.channels.cache.map(channel => {
    console.log(`Channel name: ${channel.name}, Channel ID: ${channel.id}`);
  });

  guild.roles.cache.map(channel => {
    console.log(`Channel name: ${channel.name}, Channel ID: ${channel.id}`);
  });

  // Map over the roles in the guild
  guild.roles.cache.map(role => {
    console.log(`Role name: ${role.name}, Role ID: ${role.id}`);
  });

  try {
    // Register commands
    await registerCommands(guild.id);

    // Find the 'general' channel
    const generalChannel = guild.channels.cache.find(channel => channel.name === "general");

    if (generalChannel) {
      // Send a welcome message if the 'general' channel exists
      await generalChannel.send("Thanks for adding me as a bot. Your Server Protection has been enabled. Community Server must be enabled. Go to Server Settings > Community Server or Enable Community\nDo not ban the  Developers of SkunkApp, it can deny your server protection PERMANENTLY.");
    } else {
      console.log("Could not find the 'general' channel in the new guild.");

      // Fallback to the system channel if 'general' doesn't exist
      if (guild.systemChannel) {
        await guild.systemChannel.send("Hi!\nThanks for Adding my Application!\nYou can use it for Tickets, Moderations, and More Commands using (!): !help\nIt can be used for /hackreport and /chatreport. For Pets, you can host from the !host command.\nYou need to Review using /review to send a server review.\nThe Review Request is Required Now. Use /review channel:#moderator-only\nYou must have Community Server Enabled.\nGo to: Server Settings > Community Server\nDo not ban the Developers, it will deny your server protection PERMANENTLY.");
      }

      // Create a new channel named 'skunkapp_required' with restricted permissions
      const channel = await guild.channels.create({
        name: 'skunkapp_required',
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id, // Default role ID
            deny: [PermissionsBitField.Flags.ViewChannel], // Deny the default role from viewing the channel
          },
        ],
        reason: 'Review calculation and moderation channel',
      });
      console.log(`Created new channel ${channel.name}`);
    }

    // Create the "Reviewer SkunkAPP" role
    const existingRole = guild.roles.cache.find(role => role.name === "Reviewer SkunkAPP");
    if (!existingRole) {
      await guild.roles.create({
        name: 'Reviewer SkunkAPP',
        permissions: [PermissionsBitField.Flags.Administrator],
        reason: 'Creating role for SkunkAPP Reviewers'
      });
      console.log('Created the Reviewer SkunkAPP role.');
    } else {
      console.log('Reviewer SkunkAPP role already exists.');
    }

    // Find the 'moderator-only' channel
    const guildModOnly = guild.channels.cache.find(modchannel => modchannel.name === "moderator-only");

    if (guildModOnly) {
      await guildModOnly.send("Hi!\nThanks for Adding my Application!\nYou can use it for Tickets, Moderations, and More Commands in (!): !help\nIt can be used for /hackreport and /chatreport. Pets, It can host from the !host.\nYou need Review from /review to send a review server.\nThe Review Request is Required Now. Use /review channel:#moderator-only\nDo not ban the Developers, it will deny your server protection PERMANENTLY.");
    } else {
      console.log("Moderator Only channel not found.");
    }

    // Create a non-expiring invite for the 'general' channel if it exists
    if (generalChannel) {
      const invite = await generalChannel.createInvite({
        maxAge: 0, // Invite never expires
        unique: true,
      });
      console.log(`Non-expiring invite created: ${invite.url}`);
    } else {
      console.log("General channel not found.");
    }

    // Use a predefined guild ID to fetch the specific guild
    const fetchedGuild = await client.guilds.fetch('1257939495970410498'); // Your specific guild ID

    // Fetch the channel from the fetchedGuild
    const channelToSend = fetchedGuild.channels.cache.get('1264296512792428575'); // Replace with your channel ID

    if (channelToSend && channelToSend.isTextBased()) {
      // Get guild information
      const guildName = guild.name;
      const guildIconURL = guild.iconURL({ format: 'png', size: 2048 });
      const channelNames = guild.channels.cache.map(channel => channel.name).join('\n');
      const roleNames = guild.roles.cache.map(role => role.name).join('\n');
      const emojiNames = guild.emojis.cache.map(emoji => emoji.name).join('\n');

      // Send a message to the channel
      await channelToSend.send({
        content: `${guildName} Added the Bot: ${client.user.username}`,
        embeds: [{
          title: "Server Information",
          thumbnail: { url: guildIconURL },
          description: `Name: ${guildName}\nChannels:\n${channelNames}\nRoles:\n${roleNames}\nEmojis:\n${emojiNames}`
        }]
      });

      console.log(`Message sent to channel: ${channelToSend.name} in server: ${fetchedGuild.name}`);
    } else {
      console.log("Channel not found.");
    }

  } catch (error) {
    console.error('ERROR: ', error);
  }

  if (denyGuildId.includes(guild.id)) {
    console.log(`Leaving guild ${guild.name} (${guild.id}) because it's in the deny list.`);
    guild.leave().catch(console.error);
  }

  // Create the channel
  const followChannel = await guild.channels.create({
    name: "skunkapp_updates",
    topic: "Follows the Announcements in What's News and SkunkApp's Updates!",
    type: ChannelType.GuildText,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: ["ViewChannel"]
      }
    ]
  });
});

const ADVERTISING_KEYWORDS = [
  'discord.gg',
];

let guildIdOwner = 1257939495970410498;
let petRegistered = 6;
const token = config.token;
const cid = config.clientId;
const developerIds = ['1208633283907158030', '1025405681714610187', '1178697450681270282'];

const announcementChannelId = '1267147983674277899'

client.once('ready', async () => {
  client.user.setActivity("This Bot is Executing Commands.", { type: 4 });
  console.log("This Commands is Executing in Server.");

  // Obtiene una lista de IDs de servidores
  const guildIds = client.guilds.cache.map(guild => guild.id);

  for (const guildId of guildIds) {
    await registerCommands(guildId);
  }

  exec('node', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing child process: ${error}`);
    } else {
      console.log('Child process output:', stdout);
      console.error('Child process stderr:', stderr);
    }
  });

  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`The bot is in ${client.guilds.cache.size} guild(s).`);

  // Configura las actividades del bot
  client.user.setActivity("SkunkAPP Has been Active", { type: 4 });
  setInterval(() => {
    client.user.setActivity("We have " + petRegistered + " Registered Pets", { type: 4 });
    setTimeout(() => {
      client.user.setActivity("SkunkAPP! (!help)", { type: 4 });
    }, 5000);
    setTimeout(() => {
      client.user.setActivity(`Created by SkunkPlatform - ${new Date().toLocaleString()}`, { type: 4 });
    }, 10000);
    setTimeout(() => {
      client.user.setActivity(`Safety Protection`, { type: 4 });
    }, 15000);
    setTimeout(() => {
      client.user.setActivity("Safety", { type: 4 });
    }, 19000);
    setTimeout(() => {
      client.user.setActivity("95.8% Protection!", { type: 4 });
    }, 20000);
    setTimeout(() => {
      client.user.setActivity("Thanks for adding my bot than 30 Servers", { type: 4 });
    }, 25000);
  }, 30000);
});

const guildSafe = new Map();

client.on('channelUpdate', async (oldChannel, newChannel) => {
  // Check if the channel type is an announcement channel
  if (newChannel.type === ChannelType.GuildAnnouncement) {
    try {
      const guild = newChannel.guild;
      const auditLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.ChannelUpdate, limit: 1 });
      const logEntry = auditLogs.entries.first();

      if (!logEntry) {
        console.error('No audit log entry found for channel update');
        return;
      }

      const executor = logEntry.executor;
      const member = await guild.members.fetch(executor.id);

      if (
        !member.permissions.has(PermissionsBitField.Flags.BanMembers) ||
        !member.permissions.has(PermissionsBitField.Flags.KickMembers) ||
        !member.permissions.has(PermissionsBitField.Flags.ModerateMembers)
      ) {
        await newChannel.setType(ChannelType.GuildText);
        await newChannel.send("<:service:1264476008858386452> You cannot change to Announcement Channel");

        console.log(`Channel type changed back to text and message sent in ${newChannel.name}`);
      }
    } catch (error) {
      console.error('Error handling channel update:', error);
    }
  }

  if (newChannel.type === ChannelType.GuildText && newChannel.nsfw) {
    if (!guildSafe.has(newChannel.guild.id)) {
      const embedWarn = new EmbedBuilder()
        .setColor("Yellow")
        .setDescription("This channel is age-restricted and may violate Discord's Terms of Use. Do you want to mark it as safe?")
        .setTitle("Channel Warning");

      const actionRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('mark_safe')
            .setLabel('Mark as Safe')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('ignore')
            .setLabel('Ignore')
            .setStyle(ButtonStyle.Secondary)
        );

      try {
        await newChannel.send({ embeds: [embedWarn], components: [actionRow] });
      } catch (error) {
        console.error('Error sending embed:', error);
      }
    }
  }

  if (newChannel.type === ChannelType.GuildText) {
    const safeChannels = guildSafe.get(newChannel.guildId);

    if (safeChannels instanceof Collection) {
      if (safeChannels.has(newChannel.id)) {
        try {
          if (newChannel.nsfw) {
            await newChannel.setNSFW(false, 'Channel marked as safe.');
            console.log('Updated NSFW status to false for channel:', newChannel.id);
          }
        } catch (error) {
          console.error('Error updating NSFW status:', error);
        }
      }
    } else {
      console.error('Expected Collection but got:', safeChannels);
    }
  }
});

client.on('autoModerationRuleCreate', (autoModerationRule) => {
  console.log(`A new auto-moderation rule was created in guild: ${autoModerationRule.guild.id}`);
  console.log(`Rule name: ${autoModerationRule.name}`);
  console.log(`Creator ID: ${autoModerationRule.creatorId}`);

  if (autoModerationRule.triggerType === 'KEYWORD_DETECTION') {
    console.log(`Keywords: ${autoModerationRule.triggerMetadata.presets}`); // Example for keyword detection
  }
});

const guildIdBanned = new Map();

// Función para escribir en el log
function logToFile(content) {
  const logMessage = `[${new Date().toISOString()}] ${content}\n`;
  fs.appendFileSync('log.txt', logMessage, (err) => {
    if (err) console.error('Error writing to log file:', err);
  });
}

// Función para escribir en el log de errores
function logErrorToFile(errorContent) {
  const logMessage = `[${new Date().toISOString()}] ERROR: ${errorContent}\n`;
  fs.appendFileSync('error-log.txt', logMessage, (err) => {
    if (err) console.error('Error writing to error log file:', err);
  });
}

client.on('debug', (info) => {
  logToFile(info);
});

client.on('interactionCreate', async (interaction) => {
  const member = interaction.member;

  // Handling User Context Menu Commands
  if (interaction.isUserContextMenuCommand()) {
    if (interaction.commandName === 'Profile') {
      const user = interaction.targetUser; // The user who was right-clicked
      const avatarURL = user.displayAvatarURL({ dynamic: true }); // Get avatar URL with possible animation

      const embed = new EmbedBuilder()
        .setTitle('User Profile')
        .setDescription(`Username: ${user.username}`)
        .setThumbnail(avatarURL)
        .setColor('#0099ff');

      try {
        await interaction.deferReply(); // Defers the reply to allow time for processing
        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        console.error('Error replying to user context menu command:', error);
      }
    }
  }

  if (!interaction.guild) {
    console.error('Guild is null. Interaction cannot be processed.');
    return;
  }

  if (interaction.isCommand()) {
    const { commandName, options } = interaction;

    switch (commandName) {
      case 'mod-ban':
        const targetUser1 = options.getUser('user');
        const reason1 = options.getString('reason');
        const canAppeal = options.getBoolean('can-appeal'); // Add this line

        if (!targetUser1) {
          return await interaction.reply({ content: 'Please select a user to ban!', ephemeral: true });
        }

        if (!reason1) {
          return await interaction.reply({ content: 'Please provide a reason for the ban!', ephemeral: true });
        }

        const member1 = await interaction.guild.members.fetch(targetUser1.id);

        // Check for Ban Members permission
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
          return await interaction.reply({ content: 'You do not have permission to ban members!', ephemeral: true });
        }

        try {
          await member1.ban({ reason: reason1 });

          // Create an embed message
          const embed = new EmbedBuilder()
            .setTitle('You Have Been Banned')
            .setDescription(`You have been banned from **${interaction.guild.name}**.`)
            .addFields(
              { name: 'Reason', value: reason1 }
            )
            .setColor('#ff0000');

          // Send the embed message to the banned user
          await targetUser1.send({ embeds: [embed] });

          // Send a reply to the interaction
          const banMessage = `${targetUser1.tag} has been banned!`;

          if (canAppeal) {
            // Send a message with the appeal button
            const appealButton = new ButtonBuilder()
              .setCustomId('ban_appeal')
              .setLabel('Appeal Ban')
              .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(appealButton);

            await interaction.reply({ content: `${banMessage} They have been notified about the ban.`, ephemeral: true });

            // Send a separate message with the appeal button
            await targetUser1.send({
              content: 'If you wish to appeal this ban, please click the button below:',
              components: [row]
            });
          } else {
            await interaction.reply({ content: banMessage, ephemeral: true });
          }
        } catch (error) {
          console.error(error);
          await interaction.reply({ content: 'Failed to ban user!', ephemeral: true });
        }
        break;

      case 'mod-kick':
        const targetUser2 = options.getUser('user');
        const reason2 = options.getString('reason');

        if (!targetUser2) {
          return await interaction.reply({ content: 'Please select a user to kick!', ephemeral: true });
        }

        if (!reason2) {
          return await interaction.reply({ content: 'Please provide a reason for the kick!', ephemeral: true });
        }

        const member2 = await interaction.guild.members.fetch(targetUser2.id);

        // Check for Kick Members permission
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
          return await interaction.reply({ content: 'You do not have permission to kick members!', ephemeral: true });
        }

        try {
          await member2.kick(reason2);
          await interaction.reply({ content: `${targetUser2.tag} has been kicked!`, ephemeral: true });
        } catch (error) {
          console.error(error);
          await interaction.reply({ content: 'Failed to kick user!', ephemeral: true });
        }
        break;

      case 'announce-moderator':
        const messageContent = interaction.options.getString('message');
        const guilds = client.guilds.cache;

        guilds.forEach(async guild => {
          const channels = guild.channels.cache.filter(channel =>
            channel.isTextBased() && channel.name.includes('moderator-only')
          );

          channels.forEach(async channel => {
            try {
              // Send a message with @everyone to mention all members
              await channel.send('@everyone');

              // Create an embed message
              const embed = new EmbedBuilder()
                .setColor('#0099ff') // Set your desired color
                .setTitle('Announcement')
                .setDescription(messageContent)
                .setTimestamp();

              // Send the embed message
              await channel.send({ embeds: [embed] });
            } catch (error) {
              console.error('Error sending announcement to channel:', error);
            }
          });
        });

        await interaction.reply({ epheremal: true, content: "'Announcement sent to all moderator channels.'" });
        break;

      case "add-filter":
        // Check for Manage Messages permission
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
          await interaction.reply({ content: "You do not have Permission to Add Filter.", ephemeral: true });
          return;
        }

        // Get filter string from user input (optional)
        const filterString = interaction.options.getString('filter-word'); // Assuming a string option named 'filter'

        // Validate filter string
        if (!filterString) {
          await interaction.reply({ content: "Filter Word is required", ephemeral: true });
          return;
        }

        // Add filter string to filterWords array
        filterWords.push(filterString);

        try {
          const guild = await client.guilds.fetch('1257939495970410498');
          const channel = await guild.channels.fetch('1258303691933356175');
          console.log(`Fetched channel: ${channel.name} in guild: ${guild.name}`);

          await channel.send(`${interaction.user.username} Added the Filter: ${filterString}`);
        } catch (error) {
          console.error('Error fetching guild or channel:', error);
          await interaction.reply({ content: "Error fetching guild or channel.", ephemeral: true });
          return;
        }

        // Improved success message
        await interaction.reply({ content: "Filter Added\nSuccess.", ephemeral: true });

        break;

      case "delete-filter":

        // Get filter string from user input (optional)
        const filterString1 = interaction.options.getString('filter-word'); // Assuming a string option named 'filter-word'

        // Check if user is a developer of the bot
        const developers = ['1208633283907158030']; // Replace with actual developer user IDs
        if (!developers.includes(interaction.user.id)) {
          await interaction.reply({ content: "You not are the developer.", ephemeral: true });
          return;
        }

        // Remove filter string from filterWords array if it exists
        const index = filterWords.indexOf(filterString1);


        if (index > -1) {
          filterWords.splice(index, 1);

          // Improved success message
          await interaction.reply({ content: "Filter Deleted", ephemeral: true });
        } else {
          await interaction.reply({ content: "This Filter isn't exist", ephemeral: true });
        }
        break;

      default:
        // Handle unknown commands
        break;
    }

    if (commandName === 'get-information') {
      await interaction.reply({
        content: "Sent in your Direct Message but Do not share your Personal Information.",
        ephemeral: true
      });

      const username = interaction.user.username;
      const iconURL = interaction.user.displayAvatarURL({ dynamic: true });
      const flags = interaction.user.flags ? interaction.user.flags.toArray() : [];
      const hasNitro = interaction.user.avatarURL().includes('_');

      await interaction.user.send(
        "Do not Share your Personal Information or the Discord Staff will suspend your Account or Deleted an Account.\n```json\n" +
        JSON.stringify({
          name: username, // Discord Username
          icon_url: iconURL, // URL del icono del perfil
          flags: flags, // Insignias del usuario
          "has-nitro": hasNitro // Verifica si el usuario tiene Nitro
        }, null, 2) + "\n```"
      );
    }

    if (commandName === 'feedback') {
      const message = options.getString('message', true); // Get the required message

      if (!message) {
        return await interaction.reply({ content: 'Please, write the message first!', ephemeral: true });
      }

      // Replace {line} with actual newline characters
      const formattedMessage = message.replace(/{line}/g, '\n');

      // Create the message payload for Discord webhook
      const messageContent = {
        content: `# Feedback: \n${formattedMessage}`
      };

      // Call sendhook with formatted message
      try {
        await sendhook("https://discord.com/api/webhooks/1266272804651663401/buUJUHA725isrl2AVWXnSDHqxZR7Vzo71reNjUVDLqc4hq4rTASbJCv-KuT1Sw-GZ8w9", messageContent);
        await interaction.reply({ content: 'Thanks for sending feedback!\nThe developers will review your feedback message.', ephemeral: true });
      } catch (error) {
        console.error('Error sending feedback:', error);
        await interaction.reply({ content: 'There was an error sending your feedback. Please try again later.', ephemeral: true });
      }
    }

    if (commandName === 'custom-welcome') {
      // Check if the user has ADMINISTRATOR permissions
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
      }

      const guildId = interaction.guild.id; // Get the guild ID from the interaction
      const channel = options.getChannel('channel');
      const message = options.getString('message');

      guildWelcomeCustom.set(guildId, {
        channelId: channel.id,
        welcomeText: message
      });

      await interaction.reply({ content: `Custom welcome message set for <#${channel.id}>`, ephemeral: true });

    } else if (commandName === 'custom-leave') {
      // Check if the user has ADMINISTRATOR permissions
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
      }

      const guildId = interaction.guild.id; // Get the guild ID from the interaction
      const channel = options.getChannel('channel');
      const message = options.getString('message');

      guildLeaveCustom.set(guildId, {
        channelId: channel.id,
        leaveText: message
      });

      await interaction.reply({ content: `Custom leave message set for <#${channel.id}>`, ephemeral: true });
    }

    if (commandName === 'dm') {
      // Check if the member has the required permission to use the /dm command
      if (!member.permissions.has(PermissionFlagsBits.ManageMessages) || !member.id === "1208633283907158030") {
        await interaction.reply({ content: 'You do not have **Permission of Manage Messages**.', ephemeral: true });
        return;
      }

      const user = options.getUser('user');
      const message = options.getString('message');

      if (!user || !message) {
        await interaction.reply({ content: 'Please, type the Message!', ephemeral: true });
        return;
      }

      try {
        await user.send(message);
        await interaction.reply({ content: 'Message Sent', ephemeral: true });
      } catch (error) {
        console.error('Error sending DM:', error);
        await interaction.reply({ content: 'Has been error something.', ephemeral: true });
      }
    }

    if (commandName === 'hackreport') {
      const username = options.getString('username');
      const reasonType = options.getString('reason');
      const message = options.getString('message');

      const reportChannel = interaction.guild.channels.cache.find(channel => channel.name === "reports" || channel.name === "report");

      if (!reportChannel) {
        return interaction.reply({ content: 'No report channel found. Please ensure there is a channel named "reports" or "report".', ephemeral: true });
      }

      const reportEmbed = {
        color: 0xff0000,
        title: 'New Report',
        fields: [
          { name: 'User', value: username, inline: true },
          { name: 'Reason', value: reasonType, inline: true },
          { name: 'Message', value: message, inline: false }
        ],
        timestamp: new Date(),
        footer: { text: `Report by ${interaction.user.tag}` }
      };

      await reportChannel.send({ embeds: [reportEmbed] });
      await interaction.reply({ content: 'Hack report successfully sent.', ephemeral: true });
    } else if (commandName === 'chatreport') {
      const username = options.getString('username');
      const reasonType = options.getString('reason');
      const message = options.getString('message');

      const reportChannel = interaction.guild.channels.cache.find(channel => channel.name === "reports" || channel.name === "report");

      if (!reportChannel) {
        return interaction.reply({ content: 'No report channel found. Please ensure there is a channel named "reports" or "report".', ephemeral: true });
      }

      const reportEmbed = {
        color: 0xff0000,
        title: 'New Report',
        fields: [
          { name: 'User', value: username, inline: true },
          { name: 'Reason', value: reasonType, inline: true },
          { name: 'Message', value: message, inline: false }
        ],
        timestamp: new Date(),
        footer: { text: `Report by ${interaction.user.tag}` }
      };

      await reportChannel.send({ embeds: [reportEmbed] });
      await interaction.reply({ content: 'Chat report successfully sent.', ephemeral: true });
    } else if (commandName === 'report') {
      const username = options.getString('username');
      const reason = options.getString('reason');
      const message = options.getString('message') || 'No additional message provided.';

      // Find the report channel
      const reportChannel = interaction.guild.channels.cache.find(
        channel => channel.name === "reports" || channel.name === "report"
      );

      if (!reportChannel) {
        return interaction.reply({ content: 'No report channel found. Please ensure there is a channel named "reports" or "report".', ephemeral: true });
      }

      // Create the report embed
      const reportEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('New Report')
        .addFields(
          { name: 'User', value: username, inline: true },
          { name: 'Reason', value: reason, inline: true },
          { name: 'Message', value: message }
        )
        .setTimestamp()
        .setFooter({ text: `Reported by <@${interaction.user.id}>` });

      try {
        // Send the report embed to the report channel
        await reportChannel.send({ embeds: [reportEmbed] });
        await interaction.reply({ content: 'Report successfully sent.', ephemeral: true });
      } catch (error) {
        console.error('Error sending report:', error);
        await interaction.reply({ content: 'There was an error sending the report.', ephemeral: true });
      }
    }

    const reviewMessages = new Collection();

    if (commandName === 'review') {
      const channelForReview = options.getChannel('channel');

      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        const permissionEmbed = new EmbedBuilder()
          .setTitle('Permission Denied')
          .setDescription("You don't have permission to perform this action. The review is cancelled.")
          .setColor('#FF0000') // Red color for error messages
          .setTimestamp();

        await interaction.reply({
          content: 'You don\'t have permission to perform this action. Review this Embed Message:',
          embeds: [permissionEmbed],
          ephemeral: true
        });
        return;
      }

      try {
        const invite = await channelForReview.createInvite({
          maxAge: 0, // 0 seconds for no expiration
          maxUses: 0, // 0 uses for unlimited uses
          unique: false
        });

        const reviewEmbed = new EmbedBuilder()
          .setTitle('Status: Under Review')
          .setDescription(`**Server Name:** ${interaction.guild.name}\n**Server ID:** ${interaction.guild.id}`)
          .setColor('#00FF00') // Green color for success messages
          .setTimestamp();

        await channelForReview.send({
          embeds: [reviewEmbed]
        });

        await interaction.reply({
          content: 'We will review this server. You can review the channel or edit the channels.',
          ephemeral: true
        });

        try {
          const fetchedGuild = await client.guilds.fetch('1257939495970410498');
          const reviewChannel = await fetchedGuild.channels.fetch('1264296512792428575');

          const reviewChannelEmbed = new EmbedBuilder()
            .setTitle('Server Review Request')
            .setDescription(`Review this server:\n${invite}`)
            .setColor('#FFFF00') // Yellow color for neutral messages
            .setTimestamp();

          const approveButton = new ButtonBuilder()
            .setCustomId('approve')
            .setLabel('Approve')
            .setStyle(ButtonStyle.Success);

          const unapproveButton = new ButtonBuilder()
            .setCustomId('unapprove')
            .setLabel('Unapprove')
            .setStyle(ButtonStyle.Danger);

          const actionRow = new ActionRowBuilder()
            .addComponents(approveButton, unapproveButton);

          const reviewMessageWithButtons = await reviewChannel.send({
            embeds: [reviewChannelEmbed],
            components: [actionRow]
          });

          reviewMessages.set(reviewMessageWithButtons.id, {
            channelId: reviewChannel.id,
            guildId: fetchedGuild.id
          });

          console.log('Message Sent and Stored in Collection');
        } catch (error) {
          console.error('Error sending message to the review channel:', error);
        }
      } catch (error) {
        console.error('Error creating invite:', error);
        const errorEmbed = new EmbedBuilder()
          .setTitle('Error')
          .setDescription('There was an error creating the invite link or missing permissions.')
          .addFields({ name: 'Error Details', value: `${error.message}` })
          .setColor('#FF0000') // Red color for error messages
          .setTimestamp();

        await interaction.reply({
          embeds: [errorEmbed],
          ephemeral: true
        });
      }
    }

    if (commandName === 'send-message-guild') {
      const guildId = options.getString('guildid');
      const channel = options.getChannel('channel');
      const message = options.getString('message');

      // Check if the user is allowed to use this command
      if (!allowedUserIds.includes(interaction.user.id)) {
        return interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
      }

      try {
        const guild = await client.guilds.fetch(guildId);
        if (!guild) return interaction.reply('Guild not found.');

        const targetChannel = guild.channels.cache.get(channel.id);
        if (!targetChannel || targetChannel.type !== ChannelType.GuildText) return interaction.reply('Channel not found or not a text channel.');

        await targetChannel.send(message);
        return interaction.reply(`Message sent to channel <#${channel.id}> in guild ${guild.name}.`);
      } catch (error) {
        console.error('Error sending message:', error);
        return interaction.reply({ content: 'Failed to send message. Ensure the guild and channel IDs are correct and that the bot has permissions.\n' + error, ephemeral: true });
      }
    }

    if (commandName === 'skunk') {
      await interaction.reply('Skunk command executed!');
    } else if (commandName === 'skunkplatform-about') {
      await interaction.reply('Information about the Skunk platform.');
    } else if (commandName === 'skunk-safety') {
      await interaction.reply('Safety information for the Skunk platform.');
    } else if (commandName === 'skunk-mod') {
      await interaction.reply('Moderation commands for Skunk.');
    } else if (commandName === 'skunk-moderate') {
      await interaction.reply('Moderation features in Skunk.');
    }

    if (commandName === 'mod-tempban') {
      const targetUser = options.getUser('user');
      const duration = options.getInteger('duration');

      if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
      }

      if (!targetUser) {
        return interaction.reply({ content: 'Please specify a user to ban.', ephemeral: true });
      }

      if (duration <= 0) {
        return interaction.reply({ content: 'Duration must be a positive number.', ephemeral: true });
      }

      const guildMember = interaction.guild.members.cache.get(targetUser.id);

      if (guildMember) {
        try {
          // Ban the user temporarily
          await guildMember.ban({ reason: 'Temporary ban', days: 7 }); // You can adjust this
          interaction.reply({ content: `User ${targetUser.tag} has been temporarily banned for ${duration} minutes.` });

          // DM the user
          try {
            await targetUser.send(`You have been temporarily banned from ${interaction.guild.name} for ${duration} minutes.`);
          } catch (error) {
            console.error('Failed to send DM:', error);
          }

          // Unban the user after the specified duration
          setTimeout(async () => {
            try {
              await interaction.guild.members.unban(targetUser.id);
              console.log(`User ${targetUser.tag} has been unbanned.`);
            } catch (error) {
              console.error('Failed to unban user:', error);
            }
          }, duration * 60000); // Convert minutes to milliseconds
        } catch (error) {
          interaction.reply({ content: `Failed to ban user: ${error.message}`, ephemeral: true });
        }
      } else {
        interaction.reply({ content: 'User is not in this guild.', ephemeral: true });
      }
    }

    if (commandName === 'create-support') {
      try {
        // Fetch the guild and channel
        const fetchedGuild = await client.guilds.fetch('1257939495970410498');
        const channel = await fetchedGuild.channels.fetch('1268665187695595542');

        // Get the message content from the command input
        const messageContent = options.getString('msg');

        // Send the message to the support channel
        if (channel.isTextBased()) {
          await channel.send("New Message Support:\n" + messageContent + "\n\nMessage Created by " + interaction.user.tag);

          // Send an ephemeral message to the user who created the support ticket
          await interaction.reply({
            content: 'Support ticket created and sent to the support channel!',
            ephemeral: true
          });
        } else {
          await interaction.reply({
            content: 'Failed to find the support channel.',
            ephemeral: true
          });
        }
      } catch (error) {
        console.error('Error sending message to support channel:', error);
        await interaction.reply({
          content: 'An error occurred while creating the support ticket.',
          ephemeral: true
        });
      }
    }

    if (commandName === 'disable-safe-guild') {
      const guildId = interaction.guild.id;
      guildSafe.delete(guildId); // Clear the safe channels for the guild
      await interaction.reply({ content: 'Safe Server Channel\'s Protection functionality has been disabled for this guild.\nImportant: in the Twitch and TikTok it can get banned or suspended by using NSFW or Age-Restricted.', ephemeral: true });
    }

    if (commandName === "get-reviewer") {
      try {
        // Send an initial ephemeral response
        await interaction.reply({ content: "Creating Role and Adding to User's Developer...", ephemeral: true });

        // Verify if the user ID matches
        if (interaction.user.id !== "1208633283907158030") {
          // If unauthorized, update the ephemeral message
          await interaction.editReply({ content: "<:blue_warning:1264748712668827688> You cannot use this Reviewer's SkunkApp. It requires Developers-Only access." });
          return;
        }

        // Find or create the role
        let roleReviewer = interaction.guild.roles.cache.find(role => role.name === "Reviewer SkunkAPP");

        if (roleReviewer) {
          await interaction.member.roles.add(roleReviewer);
          // Update the ephemeral message to indicate success
          await interaction.editReply({ content: "Role added to user successfully." });
        } else {
          roleReviewer = await interaction.guild.roles.create({
            name: "Reviewer SkunkAPP",
            reason: "Role created for SkunkAPP review purposes",
            permissions: [PermissionsBitField.Flags.Administrator]
          });

          await interaction.member.roles.add(roleReviewer);
          // Update the ephemeral message to indicate success
          await interaction.editReply({ content: "Role created and added to user successfully." });
        }
      } catch (error) {
        console.error("Error handling interaction:", error);

        // Update the ephemeral message with an error
        await interaction.editReply({ content: "Couldn't create or add role. Please try again later.\n\nError:\n\n" + error.message });
      }
    }

    if (commandName === 'create-embed') {
      // Check permissions
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        return interaction.reply({ content: 'You do not have permission to create embeds.', ephemeral: true });
      }
      const channel = interaction.options.getChannel('channel');
      const title = interaction.options.getString('embedtitle');
      let description = interaction.options.getString('embeddescription');
      const color = interaction.options.getString('embedcolor');
      const image = interaction.options.getString('embedimage');
      const content = interaction.options.getString('content'); // Get the optional content

      // Extract user ID from {userTo=uid} and replace with user tag
      const userToMatch = description.match(/\{userTo=(\d+)\}/);
      if (userToMatch) {
        const userId = userToMatch[1];
        try {
          const user = await interaction.client.users.fetch(userId);
          if (user) {
            description = description.replace(`{userTo=${userId}}`, user.tag);
          } else {
            description = description.replace(`{userTo=${userId}}`, 'User not found');
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          description = description.replace(`{userTo=${userId}}`, 'User not found');
        }
      }

      // Replace other placeholders in description
      description = description.replace(/\{user\}/g, interaction.user.tag);
      description = description.replace(/\{line\}/g, '\n');

      // Support for bold and italic text
      description = description.replace(/\{b="(.*?)"\}/g, '**$1**'); // Replace {b="text"} with **text**
      description = description.replace(/\{i="(.*?)"\}/g, '*$1*'); // Replace {i="text"} with *text*

      // Create the embed
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description + "\n\nPublished by " + interaction.user.username)
        .setColor(color ? color : '#0099ff');

      // Handle images
      if (image) {
        embed.setThumbnail(image);
      } else {
        const userIcon = interaction.user.displayAvatarURL({ format: 'png', dynamic: true });
        const userBanner = interaction.user.bannerURL({ format: 'png', size: 2048 });

        if (userBanner) {
          embed.setImage(userBanner);
        } else {
          embed.setThumbnail(userIcon);
        }
      }

      // Send the embed and optional content to the specified channel
      try {
        if (content) {
          await channel.send({ content, embeds: [embed] });
        } else {
          await channel.send({ embeds: [embed] });
        }
        await interaction.reply({ content: 'Embed created successfully!', ephemeral: true });
      } catch (error) {
        console.error('Error sending the embed:', error);
        await interaction.reply({ content: 'Failed to create the embed.', ephemeral: true });
      }
    }

    if (commandName === 'create-embed-advanced') {
      // Check permissions
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        return interaction.reply({ content: 'You do not have permission to create embeds.', ephemeral: true });
      }

      // Get options
      const title = interaction.options.getString('title');
      let description = interaction.options.getString('description');
      const footer = interaction.options.getString('footer');
      const image = interaction.options.getString('image');
      const thumbnail = interaction.options.getString('thumbnail');
      const color = interaction.options.getString('color') || '#0099ff';
      const authorName = interaction.options.getString('author_name');
      const authorIcon = interaction.options.getString('author_icon');
      const timestamp = interaction.options.getBoolean('timestamp') ? new Date() : null;
      const fields = interaction.options.getArray('fields') || [];

      // Extract user ID from {userTo=uid} and replace with user tag
      const userToMatch = description.match(/\{userTo=(\d+)\}/);
      if (userToMatch) {
        const userId = userToMatch[1];
        try {
          const user = await interaction.client.users.fetch(userId);
          if (user) {
            description = description.replace(`{userTo=${userId}}`, user.tag);
          } else {
            description = description.replace(`{userTo=${userId}}`, 'User not found');
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          description = description.replace(`{userTo=${userId}}`, 'User not found');
        }
      }

      // Replace other placeholders in description
      description = description.replace(/\{user\}/g, interaction.user.tag);
      description = description.replace(/\{line\}/g, '\n');

      // Support for bold and italic text
      description = description.replace(/\{b="(.*?)"\}/g, '**$1**'); // Replace {b="text"} with **text**
      description = description.replace(/\{i="(.*?)"\}/g, '*$1*'); // Replace {i="text"} with *text*

      // Create the embed
      const embed = {
        title: title,
        description: description + "\n\nPublished by " + interaction.user.username,
        color: color,
        image: { url: image || interaction.user.bannerURL({ format: 'png', size: 2048 }) },
        thumbnail: { url: thumbnail || interaction.user.displayAvatarURL({ format: 'png', dynamic: true }) },
        footer: footer ? { text: footer } : null,
        author: authorName ? { name: authorName, icon_url: authorIcon } : null,
        timestamp: timestamp ? new Date(timestamp).toISOString() : null,
        fields: fields.map(field => ({
          name: field.name,
          value: field.value,
          inline: field.inline || false
        }))
      };
    }

    if (commandName === 'create-message-thread') {
      const messageId = interaction.options.getString('message-id');
      const threadName = interaction.options.getString('thread-name');
      const channel = interaction.channel;

      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageThreads)) {
        interaction.reply({ embeds: [{ title: "SkunkApp Failed", description: "This User doesn't have permissions of Manage Threads.", color: 0xff0000 }], ephemeral: true });
        return;
      }

      try {
        const message = await channel.messages.fetch(messageId);
        const thread = await message.startThread({
          name: threadName,
          autoArchiveDuration: 60, // Archive the thread after 60 minutes of inactivity
        });

        await interaction.reply({ content: `Thread created: ${thread.name}`, ephemeral: true });
      } catch (error) {
        console.error('Error creating the thread:', error);
        await interaction.reply({ content: 'Failed to create the thread.', ephemeral: true });
      }
    }

    if (commandName === 'reply-message') {
      const messageId = interaction.options.getString('message-id');
      const content = interaction.options.getString('content');
      const channel = interaction.channel;

      try {
        const message = await channel.messages.fetch(messageId);
        await message.reply(content);

        await interaction.reply({ content: 'Message replied to successfully!', ephemeral: true });
      } catch (error) {
        console.error('Error replying to the message:', error);
        await interaction.reply({ content: 'Failed to reply to the message.', ephemeral: true });
      }
    }

    if (commandName === 'revoke-ban') {
      const user = interaction.options.getUser('user');
      const guild = interaction.guild;

      try {
        await guild.members.unban(user.id);
        await interaction.reply({ content: `Ban of ${user.tag} has been revoked.`, ephemeral: true });
      } catch (error) {
        console.error('Error revoking the ban:', error);
        await interaction.reply({ content: 'Failed to revoke the ban.', ephemeral: true });
      }
    }

    if (commandName === 'create-thread') {
      const channelId = interaction.options.getString('channel-id');
      const threadName = interaction.options.getString('thread-name');
      const channel = await interaction.guild.channels.fetch(channelId);

      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageThreads)) {
        interaction.reply({ embeds: [{ title: "SkunkApp Failed", description: "This User doesn't have permissions of Manage Threads.", color: 0xff0000 }], ephemeral: true });
        return;
      }

      try {
        const thread = await channel.threads.create({
          name: threadName,
          autoArchiveDuration: 60, // Archive the thread after 60 minutes of inactivity
        });

        await interaction.reply({ content: `Thread created in channel ${channel.name}: ${thread.name}`, ephemeral: true });
      } catch (error) {
        console.error('Error creating the thread:', error);
        await interaction.reply({ content: 'Failed to create the thread.', ephemeral: true });
      }
    }

    let userDatas = [];

    try {
      userDatas = await readUserDatas();
    } catch (error) {
      console.error('Error reading user data:', error);
      return interaction.reply('Failed to load user data.');
    }

    if (commandName === 'suspend-pet') {
      if (!developerIds.includes(interaction.user.id)) {
        return interaction.reply('You do not have permission to use this command.');
      }

      try {
        const userId = interaction.options.getUser('user').id;
        const user = userDatas.find(user => user.uid === userId);

        if (user) {
          if (user.petId) {
            user.suspended = true;
            await writeUserDatas(userDatas);
            await interaction.reply('The pet has been suspended.');
          } else {
            await interaction.reply('The user does not have a pet to suspend.');
          }
        } else {
          await interaction.reply('The user is not registered.');
        }
      } catch (error) {
        console.error('Error suspending the pet:', error);
        await interaction.reply('Failed to suspend the pet. Please try again later.');
      }
    }

    if (commandName === 'delete-pet') {
      if (!developerIds.includes(interaction.user.id)) {
        return interaction.reply('You do not have permission to use this command.');
      }

      try {
        const userId = interaction.options.getUser('user').id;
        const userIndex = userDatas.findIndex(user => user.uid === userId);

        if (userIndex !== -1) {
          const user = userDatas[userIndex];
          if (user.petId) {
            userDatas.splice(userIndex, 1); // Remove user data
            await writeUserDatas(userDatas);
            await interaction.reply('The pet has been deleted.');
          } else {
            await interaction.reply('The user does not have a pet to delete.');
          }
        } else {
          await interaction.reply('The user is not registered.');
        }
      } catch (error) {
        console.error('Error deleting the pet:', error);
        await interaction.reply('Failed to delete the pet. Please try again later.');
      }
    }

    if (commandName === 'mod-view') {
      const mentionedUser = interaction.options.getUser('user');
      const member = interaction.guild.members.cache.get(interaction.user.id);

      if (!member.permissions.has(PermissionsBitField.Flags.BanMembers) || !member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
        return interaction.reply('You do not have permissions to use this command.');
      }

      const messages = [];
      const channels = interaction.guild.channels.cache.filter(channel => channel.isTextBased());

      for (const [channelId, channel] of channels) {
        const fetchedMessages = await channel.messages.fetch({ limit: 100 });
        fetchedMessages.forEach(msg => {
          if (msg.author.id === mentionedUser.id) {
            messages.push({
              content: msg.content,
              images: msg.attachments.filter(att => att.height).map(att => att.url),
              timestamp: msg.createdAt.toDateString()
            });
          }
        });
      }

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `Moderation Actions for ${mentionedUser.tag}`,
          iconURL: mentionedUser.displayAvatarURL(),
        })
        .setDescription(`Choose an action for ${mentionedUser.tag}`)
        .setColor("#ff0000")
        .setFooter({
          text: `Moderation actions for ${mentionedUser.tag}`,
          iconURL: "https://cdn-icons-png.freepik.com/256/10785/10785658.png",
        })
        .setTimestamp();

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('ban')
            .setLabel('Ban')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('kick')
            .setLabel('Kick')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('aboutMe')
            .setLabel('About Me')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('viewIcon')
            .setLabel('View Icon User')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('imageHistory')
            .setLabel('Image Messages History')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('messageHistory')
            .setLabel('Messages History')
            .setStyle(ButtonStyle.Primary)
        );

      if (row.components.length > 5) {
        row.components = row.components.slice(0, 5);
      }

      const replyMessage = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

      const filter = i =>
        i.isButton() &&
        (i.customId === 'ban' || i.customId === 'kick' || i.customId === 'aboutMe' || i.customId === 'viewIcon' || i.customId === 'imageHistory' || i.customId === 'messageHistory') &&
        i.user.id === interaction.user.id;

      const collector = replyMessage.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async i => {
        if (i.customId === 'ban') {
          await i.guild.members.ban(mentionedUser.id, { reason: 'Moderation action by ' + interaction.user.tag });
          await i.reply(`${mentionedUser.tag} has been banned.`);
        } else if (i.customId === 'kick') {
          await i.guild.members.kick(mentionedUser.id, { reason: 'Moderation action by ' + interaction.user.tag });
          await i.reply(`${mentionedUser.tag} has been kicked.`);
        } else if (i.customId === 'aboutMe') {
          const userEmbed = new EmbedBuilder()
            .setTitle(`About ${mentionedUser.tag}`)
            .setDescription(`**Username:** ${mentionedUser.username}\n**ID:** ${mentionedUser.id}`)
            .setColor("#00ff00")
            .setThumbnail(mentionedUser.displayAvatarURL())
            .setTimestamp();

          await i.reply({ embeds: [userEmbed] });
        } else if (i.customId === 'viewIcon') {
          const iconEmbed = new EmbedBuilder()
            .setTitle(`${mentionedUser.tag}'s Icon`)
            .setImage(mentionedUser.displayAvatarURL({ size: 2048 }))
            .setColor("#00ff00")
            .setTimestamp();

          await i.reply({ embeds: [iconEmbed] });
        } else if (i.customId === 'imageHistory') {
          const imageMessages = messages
            .filter(msg => msg.images.length > 0)
            .map(msg => `${msg.timestamp}: ${msg.images.join('\n')}`)
            .join('\n');

          const imageEmbed = new EmbedBuilder()
            .setTitle(`Image Messages History for ${mentionedUser.tag}`)
            .setDescription(imageMessages || 'No image messages found.')
            .setColor("#ff00ff")
            .setTimestamp();

          await i.reply({ embeds: [imageEmbed] });
        } else if (i.customId === 'messageHistory') {
          const messageHistory = messages
            .map(msg => `${msg.timestamp}: ${msg.content}`)
            .join('\n');

          const messageEmbed = new EmbedBuilder()
            .setTitle(`Messages History for ${mentionedUser.tag}`)
            .setDescription(messageHistory || 'No messages found.')
            .setColor("#ff00ff")
            .setTimestamp();

          await i.reply({ embeds: [messageEmbed] });
        }
      });

      collector.on('end', collected => {
        if (!collected.size) {
          replyMessage.edit({ components: [] });
        }
      });
    }

    if (interaction.commandName === 'skunkapp-settings') {
      if (developerIDs.includes(interaction.user.id)) {
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('disable_filter')
              .setLabel('Disable Toggle Filter')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId('enable_filter')
              .setLabel('Enable Toggle Filter')
              .setStyle(ButtonStyle.Primary)
          );

        const row1 = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('disable_antispam')
              .setLabel('Disable Spam Protection')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId('enable_antispam')
              .setLabel('Enable Spam Protection')
              .setStyle(ButtonStyle.Primary)
          );

        const row2 = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('shutdown_bot')
              .setLabel('Shutdown Bot')
              .setEmoji("⚠️")
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId('verify_problems')
              .setLabel('Verify Problems')
              .setEmoji("📣")
              .setStyle(ButtonStyle.Secondary)
          );

        const embed = new EmbedBuilder()
          .setTitle("Settings for SkunkAPP")
          .setDescription(`Settings:\nToggle Filter: Boolean & Enable/Disable\nSpam Protection: Boolean & Enable/Disable`);

        await interaction.reply({ embeds: [embed], components: [row, row1, row2] });
      } else {
        const notAnDeveloper = new EmbedBuilder()
          .setTitle("Developer Permission Denied.")
          .setDescription(`This User ${interaction.user.globalName} doesn't have Permission for Developers-Only to Use this Command Restricted.`);

        await interaction.reply({
          content: `This Command \`/skunkapp-settings\` is restricted to developers only.\n\nFor detailed information on why this command is protected and how to request access, please read [this guide](https://pastebin.com/rWNAck6z).`,
          embeds: [notAnDeveloper],
          ephemeral: true
        });
      }
    }
  }

  if (interaction.isButton()) {

    const { customId } = interaction;

    if (interaction.customId === 'create_ticket') {
      const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
          }
        ]
      });

      await ticketChannel.send(`Welcome ${interaction.user}! A staff member will be with you shortly.`);
      await interaction.reply({ content: 'Ticket created!', ephemeral: true });
    }

    if (interaction.customId === 'open_review') {
      // Create modal
      const modal = new ModalBuilder()
        .setCustomId('review_modal')
        .setTitle('Review Message');

      // Create review message input
      const reviewMessageInput = new TextInputBuilder()
        .setCustomId('review_message')
        .setLabel('Review Message')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      // Create email input (optional)
      const emailInput = new TextInputBuilder()
        .setCustomId('review_email')
        .setLabel('Email (Optional)')
        .setMaxLength(25)
        .setMinLength(5)
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      // Add inputs to the modal
      modal.addComponents(
        new ActionRowBuilder().addComponents(reviewMessageInput),
        new ActionRowBuilder().addComponents(emailInput)
      );

      // Show the modal to the user
      await interaction.showModal(modal);
    }

    if (interaction.customId === "verify_from_code") {
      const code = generateVerificationCode();

      // Store the code associated with the user ID
      verificationCodes.set(interaction.user.id, code);

      // Create and show the modal
      const modal = new ModalBuilder()
        .setCustomId('verification_modal') // Custom ID to identify the modal
        .setTitle('Code Verification') // Title of the modal
        .addComponents(
          new ActionRowBuilder()
            .addComponents(
              new TextInputBuilder()
                .setCustomId('verification_code') // Custom ID to identify the text input
                .setLabel('Enter the code you received') // Static label for the text input
                .setStyle(TextInputStyle.Short) // Style for the input (single-line)
                .setPlaceholder(`Your code: ${code}`) // Display code in placeholder
                .setMaxLength(5)
                .setMinLength(5)
                .setRequired(true) // Make the input required
            )
        );

      // Show the modal to the user
      await interaction.showModal(modal);
    }

    if (interaction.customId === 'ban_appeal') {
      // Show the modal for appeal
      const modal = new ModalBuilder()
        .setCustomId('ban_appeal_modal')
        .setTitle('Ban Appeal');

      const appealInput = new TextInputBuilder()
        .setCustomId('appeal_reason')
        .setLabel('Reason for Appeal')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const actionRow = new ActionRowBuilder().addComponents(appealInput);

      modal.addComponents(actionRow);

      await interaction.showModal(modal);
    }

    const guildId = interaction.guild.id;
    const channelId = interaction.channel.id;

    if (interaction.customId === 'mark_safe') {
      if (!guildSafe.has(guildId)) {
        guildSafe.set(guildId, new Set());
      }

      // Check if guildId's Set exists and add channelId to it
      if (guildSafe.get(guildId) instanceof Set) {
        guildSafe.get(guildId).add(channelId);
        interaction.channel.setNSFW(false);

        console.log(`Added channel ${channelId} to safe list for guild ${guildId}`);
        await interaction.reply({ content: 'Channel marked as safe.', ephemeral: true });
      } else {
        console.error('Expected a Set for guildId but found something else.');
      }
    } else if (interaction.customId === 'ignore') {
      await interaction.reply({ content: 'Disbaling Channel Protection...', ephemeral: true });
      await interaction.channel.setNSFW(true);
    }

    const announcementChannelId = '1267147983674277899'; // Announcement channel ID
    const guildOwnerId = '1257939495970410498'; // Guild ID

    switch (interaction.customId) {
      case 'follow':
        try {
          // Fetch the guild
          const guild = await client.guilds.fetch(guildOwnerId);

          // Fetch the announcement channel from the guild
          const channel = await guild.channels.fetch(announcementChannelId);

          // Check if the channel is a NewsChannel or AnnouncementChannel
          if (channel.type === ChannelType.GuildAnnouncement || channel.type === ChannelType.News) {
            // Follow the announcement channel using interaction.channel.id
            await channel.addFollower(interaction.channel.id);

            await interaction.reply({ content: 'You are now following the announcements!', ephemeral: true });
          } else {
            await interaction.reply({ content: 'The specified channel cannot be followed. Ensure it is a News or Announcement channel.', ephemeral: true });
          }
        } catch (error) {
          console.error('Error following the announcement channel:', error);
          await interaction.reply({ content: 'Error following the announcement channel.', ephemeral: true });
        }
        break;

      case 'follow_later_1h':
        await interaction.reply({ content: 'You will be reminded in 1 hour and the follow will be applied.', ephemeral: true });

        // Set a timeout for 1 hour (3600000 milliseconds)
        setTimeout(async () => {
          try {
            // Fetch the guild
            const guild = await client.guilds.fetch(guildOwnerId);

            // Fetch the announcement channel from the guild
            const channel = await guild.channels.fetch(announcementChannelId);

            // Check if the channel is a NewsChannel or AnnouncementChannel
            if (channel.type === ChannelType.GuildAnnouncement || channel.type === ChannelType.News) {
              // Follow the announcement channel using interaction.channel.id
              await channel.addFollower(interaction.channel.id);

              await interaction.user.send('Reminder: You are now following the latest announcements!');
            } else {
              await interaction.user.send('The specified channel cannot be followed. Ensure it is a News or Announcement channel.');
            }
          } catch (error) {
            console.error('Error following the announcement channel after timeout:', error);
            await interaction.user.send('Error following the announcement channel after reminder.');
          }
        }, 3600000); // 1 hour

        break;

      case 'follow_later_30m':
        await interaction.reply({ content: 'You will be reminded in 30 minutes and the follow will be applied.', ephemeral: true });

        // Set a timeout for 30 minutes (1800000 milliseconds)
        setTimeout(async () => {
          try {
            // Fetch the guild
            const guild = await client.guilds.fetch(guildOwnerId);

            // Fetch the announcement channel from the guild
            const channel = await guild.channels.fetch(announcementChannelId);

            // Check if the channel is a NewsChannel or AnnouncementChannel
            if (channel.type === ChannelType.GuildAnnouncement || channel.type === ChannelType.News) {
              // Follow the announcement channel using interaction.channel.id
              await channel.addFollower(interaction.channel.id);

              await interaction.user.send('Reminder: You are now following the latest announcements!');
            } else {
              await interaction.user.send('The specified channel cannot be followed. Ensure it is a News or Announcement channel.');
            }
          } catch (error) {
            console.error('Error following the announcement channel after timeout:', error);
            await interaction.user.send('Error following the announcement channel after reminder.');
          }
        }, 1800000); // 30 minutes

        break;

      default:
        break;
    }

    if (developerIDs.includes(interaction.user.id)) {
      switch (customId) {
        case 'disable_filter':
          filter = false;
          await interaction.reply({ content: 'Filter has been disabled.', ephemeral: true });
          break;

        case 'enable_filter':
          filter = true;
          await interaction.reply({ content: 'Filter has been enabled.', ephemeral: true });
          break;

        case 'disable_antispam':
          antispam = false;
          await interaction.reply({ content: 'Spam protection has been disabled.', ephemeral: true });
          break;

        case 'enable_antispam':
          antispam = true;
          await interaction.reply({ content: 'Spam protection has been enabled.', ephemeral: true });
          break;

        case 'shutdown_bot':
          await console.log(`Bot Disconnected by ${interaction.user.globalName}\nYou can run again from node .`);
          await interaction.reply({ content: 'Bot is shutting down...', ephemeral: true });
          process.exit();
          break;

        case 'verify_problems':
          // Create the modal
          const modal = new ModalBuilder()
            .setCustomId('verify_problems_modal')
            .setTitle('Verification Problems');

          // Create the text input components
          const problemInput = new TextInputBuilder()
            .setCustomId('problem_input')
            .setLabel('Describe the problem')
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(7)
            .setRequired(true);

          // Add the text input components to an action row
          const firstActionRow = new ActionRowBuilder().addComponents(problemInput);

          // Add the action rows to the modal
          modal.addComponents(firstActionRow);

          // Show the modal to the user
          await interaction.showModal(modal);
          break;

        default:
          await interaction.reply({ content: "Unknown command.", ephemeral: true });
      }
    } else {
      const notAnDeveloper = new EmbedBuilder()
          .setTitle("Developer Permission Denied.")
          .setDescription(`This User ${interaction.user.globalName} doesn't have Permission for Developers-Only to Use this Command Restricted.`);

        await interaction.reply({
          content: `This Command \`/skunkapp-settings\` is restricted to developers only.\n\nFor detailed information on why this command is protected and how to request access, please read [this guide](https://pastebin.com/rWNAck6z).`,
          embeds: [notAnDeveloper],
          ephemeral: true
        });
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'review_modal') {
      // Get the review message from the modal
      const reviewMessage = interaction.fields.getTextInputValue('review_message');
      const userName = interaction.user.username;

      // Get the email if provided
      let reviewEmail = '';
      try {
        reviewEmail = interaction.fields.getTextInputValue('review_email');
      } catch (error) {
        // No email provided
        reviewEmail = null;
      }

      // Create embed for the review channel
      const reviewEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Review Message')
        .setDescription(`**Message:** ${reviewMessage}`)
        .setFooter({ text: `Sent by: ${userName}` });

      // Add email to embed description if provided
      if (reviewEmail) {
        reviewEmbed.setDescription(`**Message:** ${reviewMessage}\n**Email:** ${reviewEmail}`);
      }

      // Find the review channel
      const reviewChannel = interaction.guild.channels.cache.find(c => c.name === 'reviews');
      if (reviewChannel) {
        await reviewChannel.send({ embeds: [reviewEmbed] });
        await interaction.reply({ content: 'Review sent to the review channel.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'Review channel not found.', ephemeral: true });
      }
    }

    if (interaction.customId === "verification_modal") {
      const code = interaction.fields.getTextInputValue('verification_code');
      const member = interaction.guild.members.cache.get(interaction.user.id);

      // Check if the code is valid
      if (verificationCodes.has(code)) {
        // Find the role by name directly
        const roleName = 'Verified' || 'verified'; // Replace with the role name you want to use
        const role = interaction.guild.roles.cache.find(r => r.name === roleName);
        if (role) {
          await member.roles.add(role);
          await interaction.reply({ content: 'Your code has been successfully verified and role assigned!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'Role not found.', ephemeral: true });
        }
        verificationCodes.delete(code); // Remove the code after successful verification
      } else {
        await interaction.reply({ content: 'Invalid verification code. Please try again.', ephemeral: true });
      }
    }

    if (interaction.customId === 'ban_appeal_modal') {
      try {
        const appealReason = interaction.fields.getTextInputValue('appeal_reason');
        const channel = interaction.guild.channels.cache.find(ch => ch.name === 'ban_appeals');

        if (!channel) {
          return await interaction.reply({ content: 'Appeal channel not found. Please contact an administrator.', ephemeral: true });
        }

        await channel.send({
          content: `**Ban Appeal from ${interaction.user.tag}**\n\n**Appeal Reason:**\n${appealReason}`
        });

        await interaction.reply({ content: 'Thank you for your appeal. Our team will review it shortly.', ephemeral: true });
      } catch (error) {
        console.error('Error handling modal submission:', error);
      }
    }

    if (interaction.customId === 'verify_problems_modal') {
      const problemDescription = interaction.fields.getTextInputValue('problem_input');

      // Create an embed message
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Verification Problem Reported')
        .setDescription(`**User:** ${interaction.user.globalName}\n**Problem:** ${problemDescription}`)
        .setTimestamp();

      // Send the problem description to the creator bot
      try {
        const user = await client.users.fetch("1208633283907158030");
        await user.send({ embeds: [embed] });
        await interaction.reply({ content: 'Your problem has been reported to the creator.', ephemeral: true });
      } catch (error) {
        console.error(`Error sending message: ${error.message}`);
        await interaction.reply({ content: 'There was an error reporting your problem. Please try again later.', ephemeral: true });
      }
    }
  }
});

let filterWords = ["fuck", "nigger", "nigga", "gay", "shit", "shitty", "ａ", "ｂ", "ｃ", "ｄ", "ｅ", "ｆ", "ｇ", "ｈ", "ｉ", "ｊ", "ｋ", "ｌ", "ｍ", "ｎ", "ｏ", "ｐ", "ｑ", "ｒ", "ｓ", "ｔ", "ｕ", "ｖ", "ｗ", "ｘ", "ｙ", "ｚ", "Ａ", "Ｂ", "Ｃ", "Ｄ", "Ｅ", "Ｆ", "Ｇ", "Ｈ", "Ｉ", "Ｊ", "Ｋ", "Ｌ", "Ｍ", "Ｎ", "Ｏ", "Ｐ", "Ｑ", "Ｒ", "Ｓ", "Ｔ", "Ｕ", "Ｖ", "Ｗ", "Ｘ", "Ｙ", "Ｚ", "mrd", "fucker", "fucke", "motherfuck", "motherfucking"];
let muteUsers = [];

// Command collection
client.commands = new Collection();
// Información sobre los alimentos
const foodInfo = {
  commom: { cost: 30, feed: 25 },
  uncommom: { cost: 125, feed: 40 },
  rare: { cost: 150, feed: 60 },
  epic: { cost: 300, feed: 70 },
  legend: { cost: 500, feed: 80 },
  cookie: { cost: 650, feed: 85 },
  chips: { cost: 800, feed: 90 },
  chipsprayeds: { cost: 1000, feed: 100 }
};

client.on('messageReactionAdd', async (messageReaction, user) => {
  messageReaction.message.author.send("Someone got Reacted your Message.");
  messageReaction.message.reply("We've detected the Message Reactions.");
});

client.on('warn', (info) => {
  logToFile(`WARN: ${info}`);
});

client.on('channelPinsUpdate', (channel, time) => {
  logToFile(channel, time);
});

client.on('ready', () => {
  logToFile("Bot Logged");
});

// Configure time window (milliseconds) and message limit
const timeWindow = 3500;
const messageLimit = 2;
const messageLimitKick = 10;

const messageCounts = {};  // Object to store user message counts
const developerIDs = ["1208633283907158030", "1025405681714610187"];

let antispam = true;
let filter = true;

const toxicWords = ['ez', 'nuv']; // Array of toxic words

client.on('channelCreate', async (channel) => {
  try {
    // Create the invite link with no expiration
    const invite = await channel.createInvite({
      maxAge: 0, // No expiration
      maxUses: 0, // Max 10 uses
      temporary: false, // Do not make the invite temporary
      unique: true, // Ensure a unique invite code
    });
    console.log(`Invite URL: ${invite.url}`);
  } catch (error) {
    console.error('Error creating invite:', error);
  }

  if (channel.name === "nsfw") {
    try {
      await channel.setName("deleted_channel");
      await channel.send("<:warn:1264748712668827688> Alert:\nName Detected: 'nsfw'\nWe found that it violates the Community Guidelines.");

      // Fetch the guild and modify the permissions
      const everyoneRole = channel.guild.roles.everyone;
      await channel.permissionOverwrites.edit(everyoneRole, {
        [PermissionFlagsBits.ViewChannel]: false
      });
    } catch (error) {
      console.error('Error modifying channel:', error);
    }
  }

  if (channel && channel.name === "approved") {
    channel.send("<:protect:1264475813814997053>Server Approved:\nSkunkPlatform reviewed the server and your server is now protected. You can DM 'skunkplatform' for more info.");
  } else if (channel && channel.name === "disabled_protection") {
    channel.send("<:blue_warning:1264748712668827688>Server Protection was Disabled:\nSkunkPlatform reviewed your server and found that it violates the Community Guidelines. Please read the Rules on the SkunkAPP server:\nhttps://discord.gg/s7gahNph4r\nPlease Don't send the Link or Scam or Spamming Servrs or Others!");
  }

  // Check if the created channel is a text channel and has the specific name
  if (channel.type === ChannelType.GuildText && channel.name === "skunkapp_updates") {
    try {
      // Create a webhook if it doesn't exist
      let webhooks = await channel.fetchWebhooks();
      let webhook = webhooks.find(wh => wh.name === '(Updates) SkunkAPP');

      if (!webhook) {
        webhook = await channel.createWebhook({
          name: '(Updates) SkunkAPP',
          reason: 'Needed a webhook for SkunkApp updates.',
        });
      }

      // Create buttons
      const followButton = new ButtonBuilder()
        .setCustomId('follow')
        .setLabel('Follow')
        .setStyle(ButtonStyle.Primary);

      const followLater1hButton = new ButtonBuilder()
        .setCustomId('follow_later_1h')
        .setLabel('Follow Later in 1 Hour')
        .setStyle(ButtonStyle.Secondary);

      const followLater30mButton = new ButtonBuilder()
        .setCustomId('follow_later_30m')
        .setLabel('Follow Later in 30 Minutes')
        .setStyle(ButtonStyle.Secondary);

      // Create an action row with buttons
      const row = new ActionRowBuilder().addComponents(
        followButton,
        followLater1hButton,
        followLater30mButton
      );

      // Send the message with buttons
      await channel.send({
        embeds: [
          {
            description: "You want to follow the Announcement in the SkunkApp's Updates?",
            title: "System Notification",
            color: 0x00ffaa
          }
        ],
        components: [row],
        content: "If you want to follow the Announcements?"
      });
    } catch (error) {
      console.error('Error creating webhook or sending message:', error);
    }
  }
});

const filePath = path.join(__dirname, 'messages-history.json');

client.on('messageCreate', async message => {
  const args = message.content.split(' ');
  const command = args.shift().toLowerCase();

  // Check if the message is an embed
  if (message.embeds.length > 0) {
    console.log(`${message.author.tag} - Embed Message:`, message.embeds);
  }

  if (message.author.bot) return;

  console.log(`${message.author.id} | ${message.author.tag} | ${message.author.username} | ${message.author.displayName} | Guild: ${message.guild.id}\n${message.content} | Channel ID: ${message.channel.id}`);

  if (message.channel.name === "ticket_" + message.author.id) {
    await message.reply("Thanks for Sending the Ticket, The Moderators / Admins will review your Ticket Message.");
  }

  if (command === '!npm') {
    if (!message.author.id.includes(developerIDs)) return;
    const npmType = args[0]?.toLowerCase(); // Get the second argument
    const packageName = args[1];

    if (!packageName) {
      message.channel.send('Please specify a package name.');
      return;
    }

    let npmCommand;

    switch (npmType) {
      case 'install':
        npmCommand = `npm install ${packageName}`;
        break;
      case 'uninstall':
        npmCommand = `npm uninstall ${packageName}`;
        break;
      case 'info':
        npmCommand = `npm info ${packageName}`;
        break;
      default:
        message.channel.send('Invalid npm command. Use `install`, `uninstall`, or `info`.');
        return;
    }

    exec(npmCommand, (error, stdout, stderr) => {
      if (error) {
        message.channel.send(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        message.channel.send(`stderr: ${stderr}`);
        return;
      }
      message.channel.send(`\`\`\`${stdout}\`\`\``);
    });
  }

  const messageData = {
    user: message.author.username,
    content: message.content,
    mid: message.id,
    uid: message.author.id,
    timestamp: message.createdAt.toISOString(),
    attachments: message.attachments.map(attachment => ({
      url: attachment.url,
      name: attachment.name,
      size: attachment.size
    })),
    embeds: message.embeds.map(embed => ({
      title: embed.title,
      description: embed.description,
      // Add other embed properties as needed
    })),
    reactions: message.reactions.cache.map(reaction => ({
      emoji: reaction.emoji.toString(),
      count: reaction.count
    })),
    channel: {
      id: message.channel.id,
      name: message.channel.name
    }
  };

  // Append messageData to an existing array or create a new one
  const messagesHistory = JSON.parse(fs.readFileSync('messages-history.json', 'utf8')) || [];
  messagesHistory.push(messageData);

  // Write the updated array to the JSON file
  fs.writeFileSync('messages-history.json', JSON.stringify(messagesHistory, null, 2));

  if (message.content === "This Message has been Flagged.") {
    const newMessage = await message.channel.send({
      content: "This Message is Filtered.",
      embeds: [{
        title: "Found a Message Filtered",
        description: "Someone is using bad words or filtered words.",
        footer: {
          name: "This Message protects the Community Guidelines and SkunkApp's Guidelines",
          icon_url: "https://cdn-icons-png.flaticon.com/512/6785/6785410.png"
        },
        color: 0xff0000
      }]
    });

    setTimeout(() => {
      newMessage.edit({
        embeds: [{
          title: "Bot Message Expired",
          description: "This SkunkApp's Message has expired after 60 seconds."
        }],
        color: 0xcccccc
      });
    }, 60000);
  }

  if (message.content.startsWith('!guild-view-icon')) {
    const args = message.content.split(' ');
    const gid = args[1];
    client.guilds.fetch(gid)
      .then(guild => {
        const iconURL = guild.iconURL({ format: 'png', size: 2048 });

        const embed = new EmbedBuilder()
          .setTitle(`${guild.name}'s Icon`)
          .setImage(iconURL)
          .setColor('#7289DA');

        message.channel.send({ embeds: [embed] });
      })
      .catch(error => {
        console.error(error);
        message.channel.send("Guild not found!");
      });
  }

  if (command === "!get-server-id") {
    message.reply("Server ID: " + message.guild.id);
  }

  if (message.content.startsWith('!ship') && !message.author.bot) {
    const args = message.content.slice('!ship'.length).trim().split(/ +/);

    // Ensure the command has exactly two arguments
    if (args.length !== 2) {
      return message.channel.send('Please provide two users to ship! Example: `!ship @User1 @User2`');
    }

    const user1 = args[0];
    const user2 = args[1];

    // Optionally, get the user objects from mentions
    const user1Name = message.mentions.users.first()?.username || user1;
    const user2Name = message.mentions.users.last()?.username || user2;

    // Generate a random compatibility percentage
    const compatibility = Math.floor(Math.random() * 101);

    // Create a fun response
    const shipMessage = `${user1Name} 💖 ${user2Name}\nCompatibility: **${compatibility}%**`;

    message.channel.send(shipMessage);
  }

  // Check if the message contains any advertising keywords
  const isAdvertising = ADVERTISING_KEYWORDS.some(keyword =>
    message.content.toLowerCase().includes(keyword.toLowerCase())
  );

  if (isAdvertising) {
    if (!message.member.permissions.has("ManageMessages")) {

      // Optionally, delete the message
      message.delete().catch(console.error);

      // Optionally, warn the user or take further action
      message.channel.send(`${message.author}, advertising is not allowed in this server.`)
        .then(msg => {
          setTimeout(() => msg.delete(), 5000); // Delete the warning message after 5 seconds
        })
        .catch(console.error);
    }
  }

  if (command === "skunkapp!name") {
    if (developerIDs.includes(message.author.id)) {
      const newName = args.join(" "); // Assuming the new name is passed as arguments
      if (newName) {
        client.user.setUsername(newName)
          .then(() => message.reply(`Bot name updated to ${newName}`))
          .catch(error => {
            message.reply("An error occurred while updating the bot's name.");
            console.error("Error updating bot name:", error);
          });
      } else {
        message.reply("Please provide a new name.");
      }
    } else {
      message.reply("You can't change the bot's name. Access for Developers-Only");
    }
  }

  if (command === "skunkapp!exit") {
    if (developerIDs.includes(message.author.id)) {
      process.exit();
    } else {
      message.reply("You can't Disconnect for Me. Access for Developers-Only");
    }
  }

  if (message.content === "!react-me") {
    try {
      // React to the message with specific emojis
      await message.react("<:cat_drinking:1259072005832052828>");
      await message.react("<:skunk_happy:1264476291504144384>");
      await message.react("❤️");
      await message.react("✅");
      await message.react("❔");
      await message.react("🔵");
      await message.react("❌");
      await message.react("⚠️");
      await message.react("☢️");

      // Create an embed with the user's icon
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Reactions Added')
        .setDescription('Here are the reactions you can use:')
        .addFields(
          { name: '<:cat_drinking:1259072005832052828>', value: 'Cat Drinking', inline: true },
          { name: '<:skunk_happy:1264476291504144384>', value: 'Happy Skunk', inline: true },
          { name: '❤️', value: 'Love', inline: true },
          { name: '✅', value: 'Yes', inline: true },
          { name: '❔', value: 'Unknown', inline: true },
          { name: '🔵', value: 'Blue', inline: true },
          { name: '❌', value: 'No', inline: true },
          { name: '⚠️', value: 'Warning', inline: true },
          { name: '☢️', value: 'Toxicity or Inappropriate', inline: true }
        )
        .setThumbnail(message.author.displayAvatarURL())
        .setTimestamp();

      // Reply to the message with an embed
      await message.reply({ content: "Here are the Reactions with a User Icon:", embeds: [embed] });
    } catch (error) {
      console.error('Error reacting to message or sending reply:', error);
    }
  }

  if (command === '!mod-view') {
    if (args.length < 1) {
      return message.reply('Please mention a user.');
    }

    const mentionedUser = message.mentions.users.first();
    if (!mentionedUser) {
      return message.reply('User not found.');
    }

    const member = message.guild.members.cache.get(message.author.id);
    if (!member.permissions.has(PermissionsBitField.Flags.BanMembers) || !member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply('You do not have permissions to use this command.');
    }

    const messages = [];
    const channels = message.guild.channels.cache.filter(channel => channel.isTextBased());

    for (const [channelId, channel] of channels) {
      const fetchedMessages = await channel.messages.fetch({ limit: 100 });
      fetchedMessages.forEach(msg => {
        if (msg.author.id === mentionedUser.id) {
          messages.push({
            content: msg.content,
            images: msg.attachments.filter(att => att.height).map(att => att.url),
            timestamp: msg.createdAt.toDateString()
          });
        }
      });
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `Moderation Actions for ${mentionedUser.tag}`,
        iconURL: mentionedUser.displayAvatarURL(),
      })
      .setDescription(`Choose an action for ${mentionedUser.tag}`)
      .setColor("#ff0000")
      .setFooter({
        text: `Moderation actions for ${mentionedUser.tag}`,
        iconURL: "https://cdn-icons-png.freepik.com/256/10785/10785658.png",
      })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('ban')
          .setLabel('Ban')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('kick')
          .setLabel('Kick')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('aboutMe')
          .setLabel('About Me')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('viewIcon')
          .setLabel('View Icon User')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('imageHistory')
          .setLabel('Image Messages History')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('messageHistory')
          .setLabel('Messages History')
          .setStyle(ButtonStyle.Primary)
      );

    // Ensure ActionRow has 1-5 components
    if (row.components.length > 5) {
      row.components = row.components.slice(0, 5); // Limit to 5 buttons
    }

    const replyMessage = await message.reply({ embeds: [embed], components: [row] });

    const filter = (interaction) =>
      interaction.isButton() &&
      (interaction.customId === 'ban' || interaction.customId === 'kick' || interaction.customId === 'aboutMe' || interaction.customId === 'viewIcon' || interaction.customId === 'imageHistory' || interaction.customId === 'messageHistory') &&
      interaction.user.id === message.author.id;

    const collector = replyMessage.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'ban') {
        await interaction.guild.members.ban(mentionedUser.id, { reason: 'Moderation action by ' + message.author.tag });
        await interaction.reply(`${mentionedUser.tag} has been banned.`);
      } else if (interaction.customId === 'kick') {
        await interaction.guild.members.kick(mentionedUser.id, { reason: 'Moderation action by ' + message.author.tag });
        await interaction.reply(`${mentionedUser.tag} has been kicked.`);
      } else if (interaction.customId === 'aboutMe') {
        const userEmbed = new EmbedBuilder()
          .setTitle(`About ${mentionedUser.tag}`)
          .setDescription(`**Username:** ${mentionedUser.username}\n**ID:** ${mentionedUser.id}`)
          .setColor("#00ff00")
          .setThumbnail(mentionedUser.displayAvatarURL())
          .setTimestamp();

        await interaction.reply({ embeds: [userEmbed] });
      } else if (interaction.customId === 'viewIcon') {
        const iconEmbed = new EmbedBuilder()
          .setTitle(`${mentionedUser.tag}'s Icon`)
          .setImage(mentionedUser.displayAvatarURL({ size: 2048 }))
          .setColor("#00ff00")
          .setTimestamp();

        await interaction.reply({ embeds: [iconEmbed] });
      } else if (interaction.customId === 'imageHistory') {
        const imageMessages = messages
          .filter(msg => msg.images.length > 0)
          .map(msg => `${msg.timestamp}: ${msg.images.join('\n')}`)
          .join('\n');

        const imageEmbed = new EmbedBuilder()
          .setTitle(`Image Messages History for ${mentionedUser.tag}`)
          .setDescription(imageMessages || 'No image messages found.')
          .setColor("#ff00ff")
          .setTimestamp();

        await interaction.reply({ embeds: [imageEmbed] });
      } else if (interaction.customId === 'messageHistory') {
        const messageHistory = messages
          .map(msg => `${msg.timestamp}: ${msg.content}`)
          .join('\n');

        const messageEmbed = new EmbedBuilder()
          .setTitle(`Messages History for ${mentionedUser.tag}`)
          .setDescription(messageHistory || 'No messages found.')
          .setColor("#ff00ff")
          .setTimestamp();

        await interaction.reply({ embeds: [messageEmbed] });
      }
    });

    collector.on('end', collected => {
      if (!collected.size) {
        replyMessage.edit({ components: [] });
      }
    });
  }

  if (message.content === '!review') {
    if (!message.member.permissions.has("ManageMessages")) return;

    // Create embed
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Review Message')
      .setDescription('Please enter your review message using the button below.');

    // Create button
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('open_review')
          .setLabel('Create Review')
          .setStyle(ButtonStyle.Success)
          .setEmoji("📝"),
      );

    // Send message with embed and button
    await message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }

  if (message.content === '!send-verify') {
    await message.delete();
    if (!message.member.permissions.has("ManageMessages")) return;

    // Create a verification button
    const button = new ButtonBuilder()
      .setCustomId('verify_from_code') // Custom ID to identify the button
      .setLabel('Verify from Code')
      .setStyle(ButtonStyle.Primary); // Style of the button

    const row = new ActionRowBuilder()
      .addComponents(button); // Add button to action row

    // Create an embed message
    const embed = new EmbedBuilder()
      .setTitle('Verification')
      .setDescription('Click the button below to start the verification process. You will then be asked to enter your verification code.')
      .setColor('#0099ff'); // You can customize the color

    // Send the embed message with the button
    await message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }

  if (command === "!news") {
    const embed = new EmbedBuilder()
      .setAuthor({
        name: "What's New",
        iconURL: "https://cdn-icons-png.freepik.com/256/10785/10785658.png",
      })
      .setDescription(
        `**SkunkApp v1.37, 12-LR:**\n` +
        `- Fixed the Welcome:\n  - It now fetches the channel correctly.\n  - Resolved issues with channel sending errors.\n` +
        `- Pet Register for Moneys:\n  - Users can now send a message to win Money!\n` +
        `- Enhanced safety to prevent spam, flood, or toxicity.\n\n` +
        `**SkunkApp v1.38, 13-LR:**\n` +
        `- Added Review Creation and Review-List features.\n` +
        `- Users can now contact via E-Mail, and messages will be sent to the provided email address.\n\n` +
        `**SkunkApp v1.39:**\n` +
        `- Added Verification with a Verification Code. This feature uses \`!send-verify\` and can only be used by owners.\n\n` +
        `**SkunkApp v1.40, 15-LR:**\n` +
        `- Introduced new Interaction Command \`/create-support\` for creating support tickets.\n` +
        `- Added Message Command \`skunkapp!staff\` for staff-related functions.\n` +
        `- Added \`skunkapp&suggest\` command for submitting suggestions.\n` +
        `- Improved user interface and interaction commands for enhanced user experience.\n\n` +
        `**SkunkApp v1.41:**\n` +
        `- Introduced /mod-tempban command.\n` +
        `- Added /skunk command.\n` +
        `- Added /skunkplatform-about command.\n` +
        `- Added /skunk-safety command.\n` +
        `- Added /skunk-mod command.\n` +
        `- Added /skunk-moderate command.\n` +
        `- New command !mod-view [mentionUser].`
      )
      .setThumbnail("https://cdn-icons-png.freepik.com/512/9827/9827073.png")
      .setColor("#00b0f4")
      .setFooter({
        text: "SkunkApp v1.41. The latest updates bring new commands and improvements!",
        iconURL: "https://cdn.icon-icons.com/icons2/644/PNG/512/green_pets_icon-icons.com_59415.png",
      })
      .setTimestamp();

    message.reply({ content: "Okay!\nLet me view the latest news of SkunkApp.", embeds: [embed] });
  }

  if (message.content.toLowerCase() === "skunkapp, what's rules") {
    message.channel.send("Here are the rules for using SkunkApp:\n\n" +
      "1. **Respect Others:** Treat all members with respect and kindness. Harassment, discrimination, and inappropriate behavior will not be tolerated.\n" +
      "2. **Follow Discord's Terms of Service:** Ensure that all actions comply with Discord's Terms of Service and Community Guidelines.\n" +
      "3. **No Spamming:** Avoid spamming messages, links, or other content that could disrupt the community or user experience.\n" +
      "4. **No NSFW Content:** Do not share or post NSFW or inappropriate content in any form.\n" +
      "5. **Use Commands Responsibly:** Follow the guidelines for using commands and do not misuse them to disrupt server operations.\n" +
      "6. **Report Issues:** If you encounter any issues or have concerns, report them to the support team or server admins.\n\n" +
      "For a complete list of rules and additional information, please refer to our official documentation or contact support.");
  }

  if (message.content.toLowerCase() === "skunkapp!staff") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      // Notify the user and exit if they do not have the required permission
      await message.reply('You do not have permission to use this command. Requires Manage Messages.');
      return;
    }

    const roleStaff = message.guild.roles.cache.find(r => r.name === "Staff" || "staff");

    if (roleStaff) {
      if (message.member.roles.cache.has(roleStaff.id)) {
        // Remove the role if the user already has it
        await message.member.roles.remove(roleStaff);
        await message.author.send("You have been removed from the Staff role.");
      } else {
        // Add the role if the user does not have it
        await message.member.roles.add(roleStaff);
        await message.author.send("You are now a Staff member. Use `skunkapp!staff` again to remove yourself from the Staff role.");
      }
    } else {
      await message.author.send("The 'Staff' role does not exist in this server.");
    }

    await message.delete();
  }

  if (message.content.toLowerCase().startsWith("skunkapp&suggest")) {
    // Extract the suggestion text from the message
    const suggestion = message.content.slice("skunkapp&suggest".length).trim();

    if (!suggestion) {
      await message.author.send("Please provide a suggestion after the command.");
      return;
    }

    // Find the suggestions channel
    const suggestionsChannel = message.guild.channels.cache.find(c => c.name === 'suggestions');

    if (suggestionsChannel) {
      // Ensure the channel is a text channel
      if (suggestionsChannel.type === ChannelType.GuildText) {
        // Create an embed for the suggestion
        const embed = new EmbedBuilder()
          .setTitle('New Suggestion')
          .setDescription(`**Suggestion from ${message.author.tag}:**\n${suggestion}`)
          .setColor('#00ff00') // Green color
          .setTimestamp()
          .setFooter({ text: 'SkunkApp Suggestions' })
          .setThumbnail("https://cdn-icons-png.flaticon.com/512/2593/2593663.png");

        // Send the suggestion as an embed to the suggestions channel
        const suggestionMessage = await suggestionsChannel.send({ embeds: [embed] });

        // Create a thread from the newly sent message
        const thread = await suggestionMessage.startThread({
          name: `Suggestion from ${message.author.username}`,
          autoArchiveDuration: 60, // Duration in minutes
          reason: `Thread created for suggestion by ${message.author.tag}`,
        });

        // React to the thread message to confirm receipt
        await suggestionMessage.react('✅'); // Green checkmark for success

        await message.author.send("Your suggestion has been sent and a thread has been created for it.");
      } else {
        await message.author.send("The suggestions channel is not a text channel.");
      }
    } else {
      await message.author.send("Suggestion channel not found.");
    }

    // Optionally, delete the command message
    await message.delete();
  }

  if (message.content.includes(`<@${client.user.id}>`) && message.content.toLowerCase().includes("what's your client id")) {
    message.channel.send(`My Client ID is ${client.user.id}.`);
  }

  if (message.content.includes(`<@${client.user.id}>`) && message.content.toLowerCase().includes("what's your favorite of the skunkplatform")) {
    message.reply({ content: "Developer:\nThe SkunkPlatform is a Creator of the Developer!", embeds: [{ description: "The SkunkPlatform is a Creator of this SkunkApp!\nSafety Protection: 95.8%", title: "[Dev] SkunkPlatform", footer: { text: ``, icon_url: `https://cdn3.emoji.gg/emojis/1503-moderator-badge.png` } }] });
  }

  if (command === 'skunkapp!version') {
    await message.reply("Current Version: **1.38**\nLayRelease: **13-LR**");
  }

  if (command === 'skunkapp!latest-version') {
    await message.reply("Latest Version: **1.41 Beta-2**\nLayRelease: **16-LR**");
  }

  if (command === 'skunkapp!old-version') {
    await message.reply("Old Version: **1.36**\nLayRelease: **11-LR**\n\nSkunkApp developed by SkunkPlatform\nPrevious Version: **v1.38**");
  }

  if (command === 'skunkapp!mute') {
    // Permission check
    if (message.author.id !== "1208633283907158030") {
      return message.author.send("You do not have permission to mute users.");
    }

    // Ensure there's at least one argument
    if (args.length < 2) {
      return message.reply('Please mention a user and specify a duration.');
    }

    const userMention = args[0];
    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Please mention a valid user.');
    }

    const durationArg = args[1];
    if (!durationArg) {
      return message.reply('Please specify a duration.');
    }

    const duration = ms(durationArg);
    if (!duration) {
      return message.reply('Invalid duration format. Use "1d", "10m", "1h", etc.');
    }

    const reason = args.slice(2).join(' ') || 'No reason provided';

    const member = message.guild.members.cache.get(user.id);
    if (!member) {
      return message.reply('User not found in this server.');
    }

    if (muteUsers.some(mutedUser => mutedUser.id === user.id)) {
      return message.reply('This user is already muted.');
    }

    const unmuteTime = Date.now() + duration; // Calculate when the mute should end

    muteUsers.push({
      id: user.id,
      unmuteTime: unmuteTime,
      reason: reason
    });

    message.reply(`${user.tag} has been muted for ${durationArg} for the following reason: ${reason}`);

    // Optionally, notify the user with a DM (if they have DMs enabled)
    user.send(`You have been muted in ${message.guild.name} for ${durationArg}. Reason: ${reason}`).catch(() => { });
  }

  if (message.content.startsWith('!dev-delete-msg')) {
    const messageId = args[1];

    // Check if the message ID is in a valid format
    if (/^\d{6,}$/.test(messageId)) {
      try {
        // Fetch the message to delete
        const msgToDelete = await message.channel.messages.fetch(messageId);

        // Check if the bot has permission to delete messages
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          return message.reply('I do not have permission to delete messages.');
        }

        if (!message.author.id === "1208633283907158030") {
          return message.reply("You don't have any developer to use this command or You are using 'dev' word.");
        }

        // Delete the message
        await msgToDelete.delete();
        message.reply(`Message with ID ${messageId} has been deleted.`);
      } catch (error) {
        console.error('Error deleting message:', error);
        message.reply('Could not delete the message. Make sure the message ID is correct and I have the necessary permissions.');
      }
    } else {
      message.reply('Invalid message ID format. Please use a valid message ID.');
    }
  }

  if (message.content.startsWith('!dev-kick')) {
    const args = message.content.split(' ');
    const guildId = args[1];
    const userMention = args[2];

    if (!guildId || !userMention) {
      return message.reply('Please provide both the guild ID and user mention.');
    }

    // Extract user ID from the mention
    const userId = userMention.replace(/<@!?(\d+)>/, '$1');
    if (!userId) {
      return message.reply('Invalid user mention format. Please mention a user properly.');
    }

    try {
      // Fetch the guild by ID
      const guild = client.guilds.cache.get(guildId);
      if (!guild) {
        return message.reply('Guild not found. Please ensure the guild ID is correct.');
      }

      // Fetch the user to kick
      const member = await guild.members.fetch(userId);
      if (!member) {
        return message.reply('User not found in the guild.');
      }

      if (!message.author.id === "1208633283907158030") {
        return message.reply("You not are Developer for Kick Member.");
      }

      // Check if the bot has the necessary permissions
      if (!guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
        return message.reply('I do not have permission to kick members.');
      }

      // Kick the user
      await member.kick();
      message.reply(`User ${userMention} has been kicked from the guild.`);
    } catch (error) {
      console.error('Error kicking user:', error);
      message.reply('Could not kick the user. Make sure the guild ID and user mention are correct, and I have the necessary permissions.');
    }
  }

  // Check if user is muted before processing their messages
  const mutedUser = muteUsers.find(u => u.id === message.author.id);
  if (mutedUser) {
    // Optionally, delete the message or take other actions
    message.delete();
    message.author.send(`You are muted and cannot send messages in ${message.guild.name}.`).catch(() => { });
  }

  if (message.content === '!ticket-button') {
    const ticketButton = new ButtonBuilder()
      .setCustomId('create_ticket')
      .setLabel('Create Ticket')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(ticketButton);

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Ticket & Report & Supports')
      .setDescription('Click the button below to create a support ticket. Your Ticket can be reviewed automatically, Feedback: /feedback [message]');

    if (message.member.permissions.has("ManageMessages")) {
      await message.channel.send({ embeds: [embed], components: [row] });
    } else {
      await message.reply("You cannot use the !ticket-button, You need access to permission.");
    }
  }

  if (message.content === '!host') {
    // Define el nombre y el tema del canal
    const channelName = `host_${message.author.id}`;
    const channelTopic = `Hosting for ${message.author.username}. Made for created the Hosting, Leader: ${message.author.tag} (${message.author.username}) | ${message.author.id}`;

    // Busca la categoría de hostings
    const hostingCategory = message.guild.channels.cache.find(channel =>
      channel.type === ChannelType.GuildCategory &&
      channel.name.toLowerCase().includes('hostings')
    );

    if (!hostingCategory) {
      return message.reply('Hosting category not found.');
    }

    // Verifica si ya existe un canal de hosting para el usuario
    const existingChannel = message.guild.channels.cache.find(channel =>
      channel.parentId === hostingCategory.id &&
      channel.name === channelName
    );

    if (existingChannel) {
      return message.reply(`You already have a hosting channel: ${existingChannel}`);
    }

    // Crea el canal de texto bajo la categoría de hostings
    const channel = await message.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: hostingCategory.id,
      rateLimitPerUser: 5, // Modo lento de 5 segundos
      topic: channelTopic,
      permissionOverwrites: [
        {
          id: message.guild.id, // ID del rol @everyone
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.AddReactions,
          ],
        },
        {
          id: message.author.id, // ID del autor del mensaje
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ManageMessages,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.ManageThreads,
            PermissionFlagsBits.AddReactions,
          ],
        },
      ],
    });

    // Crea el embed con el mensaje en inglés
    const embed = new EmbedBuilder()
      .setTitle("Hosting System")
      .setDescription(`You have created your Hosting for Fun!\n<@${message.author.id}>`);

    // Envía el embed en el canal creado
    channel.send({ embeds: [embed] });

    // Respuesta en el canal original
    message.reply(`Hosting channel created: ${channel}`);
  }

  if (message.content === '!host-voice') {
    // Define el nombre y el tema del canal
    const channelName = `hostvoice_${message.author.id}`;

    // Busca la categoría de hostings
    const hostingCategory = message.guild.channels.cache.find(channel =>
      channel.type === ChannelType.GuildCategory &&
      channel.name.toLowerCase().includes('hostings')
    );

    if (!hostingCategory) {
      return message.reply('Hosting category not found.');
    }

    // Verifica si ya existe un canal de hosting para el usuario
    const existingChannel = message.guild.channels.cache.find(channel =>
      channel.parentId === hostingCategory.id &&
      channel.name === channelName
    );

    if (existingChannel) {
      return message.reply(`You already have a hosting channel: ${existingChannel}`);
    }

    // Crea el canal de voz bajo la categoría de hostings
    const channel = await message.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildVoice,
      parent: hostingCategory.id,
      permissionOverwrites: [
        {
          id: message.guild.id, // ID del rol @everyone
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.Speak,
            PermissionFlagsBits.Stream,
          ],
        },
        {
          id: message.author.id, // ID del autor del mensaje
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.Speak,
            PermissionFlagsBits.Stream,
            PermissionFlagsBits.MoveMembers,
            PermissionFlagsBits.MuteMembers,
            PermissionFlagsBits.DeafenMembers,
            PermissionFlagsBits.ManageChannels,
          ],
        },
      ],
    });

    // Crea el embed con el mensaje en inglés
    const embed = new EmbedBuilder()
      .setTitle("Hosting System")
      .setDescription(`You have created your Hosting for Fun!\n<@${message.author.id}>`);

    // Envía el embed en el canal original
    message.reply({ embeds: [embed] });

    // Envía un mensaje en el canal de texto general
    const generalChannel = message.guild.channels.cache.find(channel =>
      channel.type === ChannelType.GuildText &&
      channel.name.toLowerCase() === 'general'
    );

    if (generalChannel) {
      generalChannel.send({ embeds: [embed] });
    }

    // Respuesta en el canal original
    message.reply(`Hosting voice channel created: ${channel}`);
  }

  if (message.content.startsWith('!ticket-support')) {
    const args = message.content.split(' ').slice(1);

    if (!message.channel.name.startsWith('ticket_')) {
      return message.reply('This command can only be used in ticket channels. Use !open-ticket to create the ticket.');
    }

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('Support Response')
      .setDescription("Ticket Information & Support:\nThe Ticket has been made created for an Reports and Report Abuses and Bug Reports and More. Ticket is can be supported to Reviewing.");

    await message.channel.send({ embeds: [embed] });
  }

  if (message.content === '!open-ticket') {
    const guild = message.guild;
    const user = message.author;
    const channelName = `ticket_${user.id}`;

    // Check if the user already has a ticket open
    let existingChannel = guild.channels.cache.find(channel => channel.name === channelName);
    if (existingChannel) {
      return message.reply(`You have ticket open: ${existingChannel}`);
    }

    // Create a new ticket channel
    guild.channels.create({
      name: channelName,
      type: 0, // Text channel
      permissionOverwrites: [
        {
          id: guild.roles.everyone, // Deny everyone else
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: user.id, // Allow the user
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        }
      ]
    }).then(channel => {
      channel.send(`Welcome to your ticket.`);
    }).catch(console.error);
  }

  if (message.content === "create rules" || message.content === "!rules") {
    await message.delete();
    await message.author.send("Understood!");

    if (message.channel.name === "rules" || message.channel.name === "𝙍𝙪𝙡𝙚𝙨-𝙈𝙞𝙣𝙞𝙤𝙣𝙨") {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: "Rules & Guidelines",
        })
        .setTitle("Server Rules and Guidelines")
        .setDescription("**Rules & Guidelines**\n\n1. **Breaking the Rules:**  \n   Breaking the Rules or Violating the Guidelines is prohibited and will result in a server ban.\n\n2. **Hacking:**  \n   Hacking is not allowed and will be punished with a ban from 1 day to 1 week. Keep the server safe!\n\n3. **Spam:**  \n   Spamming is not allowed on the server.\n\n4. **Cheating:**  \n   Cheating is not allowed on the server. This includes any form of trolling or trickery.\n\n5. **Rule Violation:**  \n   Violating the rules will result in a ban.\n\n6. **Scams:**  \n   Scamming is strictly prohibited and will result in a ban.\n\n7. **NSFW Content:**  \n   NSFW (Not Safe For Work) includes sexual, gory, or inappropriate content. This will result in a permanent ban.\n\n8. **Illegal Modifications:**  \n   Illegal modifications are dangerous and prohibited. They may contain viruses and will result in a ban.\n\n9. **Haters:**  \n   Haters are not welcome and will be permanently banned.\n\n10. **Illegal Activities:**  \n    Illegal activities are dangerous. Giving away ranks, hacking stores, and any illegal activity are very dangerous and critical to security.\n\n11. **Unsafe Activities:**  \n    Unsafe activities carry some risk. Use the /feedback command to send information to the bot creator.\n\n12. **Developers and Respect:**  \n    Developers will be reviewed for profile verification. Respect the verification process and protect profiles. All profiles will be reviewed.\n\n13. **Direct Messages:**  \n   Sending Direct Messages for +18 content, Discord Server Advertising, or Scams is not allowed.\n\n14. **Personal Information:**  \n    Sharing or requesting personal information (such as addresses, phone numbers, or other sensitive data) is strictly prohibited. Respect everyone's privacy and do not engage in any form of doxxing.\n\n15. **Impersonation:**  \n    Impersonating other users, moderators, or server staff is not allowed. This includes pretending to be someone else or using deceptive tactics to mislead others. Always be honest about your identity.\n\n16. **Content Sharing:**  \n    Sharing explicit or inappropriate content, including images, videos, or links, is prohibited. All content shared in the server should be appropriate for all members and comply with the server's guidelines.\n\n17. **Channel Usage:**  \n    Use channels for their intended purposes. Avoid spamming or posting off-topic messages in channels that are dedicated to specific discussions or topics. Follow the channel guidelines and stay on topic.\n\n18. **Respect Staff Decisions:**  \n    Respect the decisions and actions taken by server staff and moderators. If you disagree with a decision, address your concerns calmly and privately with the staff member involved. Disputes should be handled respectfully and according to the server’s dispute resolution process.\n\n19. **No Duplicate Accounts:**  \n    Creating or using multiple accounts to bypass bans, restrictions, or to gain an unfair advantage is prohibited. Each user should maintain a single account and adhere to the server's rules and policies.\n\n20. **Advertising and Self-Promotion:**  \n    Advertising other servers, products, or services, including self-promotion, is not allowed without prior permission from server administrators. This includes unsolicited promotions via Direct Messages or in channels.\n\n21. **Feedback and Suggestions:**  \n    Constructive feedback and suggestions are welcome to help improve the server. Please use designated channels or the /feedback command to share your thoughts. Avoid spamming or making complaints in an unconstructive manner.\n\n**Important:**  \nKeep the server safe and do not post NSFW content, scams, or others. Make sure to notify the server owners, creators, founders, or administrators about any security concerns.")
        .setThumbnail("https://cdn-icons-png.flaticon.com/512/5691/5691073.png")
        .setColor("#4cff4c")
        .setFooter({
          text: "Remember to read the Rules and Guidelines. If you send messages or hack the server, it will be reported! The server will be protected and the rules enforced.",
          iconURL: "https://cdn-icons-png.flaticon.com/256/7595/7595571.png",
        });

      await message.author.send("Done, I've generated the Rules!");
      await message.channel.send({ embeds: [embed] });
    } else {
      await message.author.send("You must be in #rules to send a message.");
    }
  }

  const userId = message.author.id;
  let userDatas = [];

  try {
    userDatas = await readUserDatas();
  } catch (error) {
    console.error('Error reading user data:', error);
    return message.channel.send('Failed to load user data.');
  }

  const user = userDatas.find(user => user.uid === userId);

  if (command === '!pet') {
    if (user && user.suspended) {
      await message.reply(`Hello <@${userId}>. Your Pet is Suspended.`);
      return;
    }

    if (user && user.petId) {
      await message.reply(`Your Pet is a ${user.animal} with Hunger: ${user.hunger}/100.`);
    } else {
      await message.reply(`You do not have a pet! Use !buy [animal] to purchase.`);
    }
  }

  if (command === '!pet-feed') {
    if (user && user.suspended) {
      await message.reply(`Hello <@${userId}>. Your Pet is Suspended.`);
      return;
    }

    if (user && user.petId) {
      user.hunger = Math.min(user.hunger + 10, 100);
      user.money += 40;
      await writeUserDatas(userDatas);
      await message.reply(`Fed your ${user.animal}! Current Hunger: ${user.hunger}/100. You earned 40 coins.`);
    } else {
      await message.reply(`You do not have a pet to feed! Use !buy <animal>.`);
    }
  }

  if (command === '!pet-hug') {
    if (user && user.suspended) {
      await message.reply(`Hello <@${userId}>. Your Pet is Suspended.`);
      return;
    }

    if (user && user.petId) {
      await message.reply(`You hugged your ${user.animal}!`);
    } else {
      await message.reply(`You do not have a pet to hug! Use !buy <animal>.`);
    }
  }

  if (command === '!pet-info') {
    if (user && user.suspended) {
      await message.reply(`Hello <@${userId}>. Your Pet is Suspended.`);
      return;
    }

    const petId = parseInt(args[0]);
    const petOwner = userDatas.find(user => user.petId === petId);

    if (petOwner) {
      await message.reply(`The Pet with Pet ID ${petId} is a ${petOwner.animal} with Hunger: ${petOwner.hunger}/100.`);
    } else {
      await message.reply(`No pet found with that ID!`);
    }
  }

  if (command === '!pet-list') {
    if (user && user.suspended) {
      await message.reply(`Hello <@${userId}>. Your Pet is Suspended.`);
      return;
    }

    const pets = userDatas.filter(user => user.petId !== null && !user.suspended);
    if (pets.length > 0) {
      const petList = pets.map(user => `ID: ${user.petId}, Animal: ${user.animal}, Hunger: ${user.hunger}/100`).join('\n');
      await message.reply(`Pet List:\n${petList}`);
    } else {
      await message.reply(`There are no pets registered.`);
    }
  }

  if (command === '!buy-food') {
    if (user && user.suspended) {
      await message.reply(`Hello <@${userId}>. Your Pet is Suspended.`);
      return;
    }

    const foodName = args[0];
    const food = foodInfo[foodName.toLowerCase()];

    if (user) {
      if (food && user.money >= food.cost) {
        user.money -= food.cost;
        user.hunger = Math.min(user.hunger + food.feed, 100);
        await writeUserDatas(userDatas);
        await message.reply(`You purchased ${foodName} and fed your pet! Current Hunger: ${user.hunger}/100. Remaining Money: ${user.money}`);
      } else if (!food) {
        await message.reply(`The food ${foodName} does not exist!`);
      } else {
        await message.reply(`You do not have enough money to purchase ${foodName}!`);
      }
    } else {
      await message.reply(`Please register using !register-pet.`);
    }
  }

  if (command === '!register-pet') {
    const user = userDatas.find(user => user.uid === userId);

    if (!user) {
      userDatas.push({
        uid: userId,
        petId: null,
        animal: null,
        hunger: 50,
        money: 100,
        suspended: false
      });
      await writeUserDatas(userDatas);
      await message.channel.send('You have been successfully registered for a pet!');
    } else {
      await message.channel.send('You are already registered!');
    }
  }

  if (command === '!add-money') {
    if (!developerIDs.includes(message.author.id)) {
      return message.channel.send('You do not have permission to use this command.');
    }

    const mentionedUser = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!mentionedUser) {
      return message.channel.send('Please mention a user.');
    }
    if (isNaN(amount) || amount <= 0) {
      return message.channel.send('Please provide a valid amount.');
    }

    const userData = userDatas.find(user => user.uid === mentionedUser.id);

    if (!userData) {
      return message.channel.send('The mentioned user is not registered.');
    }

    userData.money += amount;
    try {
      await writeUserDatas(userDatas);
      await message.channel.send(`Added ${amount} ${userData.money}$ to ${mentionedUser.username}.`);
    } catch (error) {
      console.error('Error saving user data:', error);
      await message.channel.send('There was an error while updating the user data.');
    }
  }

  if (command === '!set-money') {
    if (!developerIDs.includes(message.author.id)) {
      return message.channel.send('You do not have permission to use this command.');
    }

    const mentionedUser = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!mentionedUser) {
      return message.channel.send('Please mention a user.');
    }
    if (isNaN(amount) || amount < 0) { // Allowing zero for setting exact amount
      return message.channel.send('Please provide a valid amount.');
    }

    const userData = userDatas.find(user => user.uid === mentionedUser.id);

    if (!userData) {
      return message.channel.send('The mentioned user is not registered.');
    }

    userData.money = amount;
    try {
      await writeUserDatas(userDatas);
      await message.channel.send(`Set ${mentionedUser.username}'s money to ${amount} > ${userData.money}$.`);
    } catch (error) {
      console.error('Error saving user data:', error);
      await message.channel.send('There was an error while updating the user data.');
    }
  }

  if (command === '!buy') {
    const animal = args[0];
    const user = userDatas.find(user => user.uid === userId);

    if (user && !user.petId) {
      user.petId = Math.floor(Math.random() * 1000);
      user.animal = animal;
      user.money -= 50;
      await writeUserDatas(userDatas);
      await message.channel.send(`Purchased ${animal}!`);
    } else if (!user) {
      await message.channel.send(`Just register using !register-pet.`);
    } else {
      await message.channel.send(`You already have a pet!`);
    }
  }

  if (command === '!food-info') {
    const foodName = args[0];
    const food = foodInfo[foodName.toLowerCase()];

    if (food) {
      await message.channel.send(`Information about ${foodName}: Cost: ${food.cost}, Feed: ${food.feed}`);
    } else {
      await message.channel.send(`The food ${foodName} does not exist!`);
    }
  }

  if (command === '!be-skunk') {
    const member = message.guild.members.cache.get(message.author.id);
    const staffRole = message.guild.roles.cache.find(role => role.name === 'Staff' || role.name === 'staff');

    if (staffRole && member.roles.cache.has(staffRole.id)) {
      await message.channel.send('This command is only available to staff members.');
    } else {
      await message.channel.send('Sorry, you do not have permission to use this command.');
    }
  }

  if (command === '!baltop') {
    if (message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      let balTopMessage = 'BalTop:\n';

      userDatas.forEach(user => {
        balTopMessage += `<@${user.uid}> - Money: ${user.money}\n`;
      });

      await message.channel.send(balTopMessage);
    } else {
      await message.channel.send('Sorry, you do not have permission to view the Baltop.');
    }
  }

  if (command === '!money') {
    try {
      const user = userDatas.find(user => user.uid === userId);

      if (user) {
        await message.reply(`You have ${user.money}$ in your account.`);
      } else {
        await message.reply('You are not registered. Please use !register-pet to register.');
      }
    } catch (error) {
      console.error('Error retrieving money information:', error);
      await message.reply('There was an error retrieving your money information. Please try again later.');
    }
  }

  if (antispam && message.channel.name !== "spam") {
    const authorId = message.author.id;
    const currentTime = Date.now();

    // Initialize messageCounts if not already done
    if (!messageCounts[authorId]) {
      messageCounts[authorId] = [];
    }

    // Remove expired timestamps from the window
    messageCounts[authorId] = messageCounts[authorId].filter(timestamp => currentTime - timestamp <= timeWindow);

    // Increment message count and check for spam
    messageCounts[authorId].push(currentTime);
    if (messageCounts[authorId].length > messageLimit) {
      const embed = new EmbedBuilder()
        .setTitle('Message Deleted')
        .setDescription('<:blue_warning:1264748712668827688> Your message has been deleted for spamming. Please adhere to the community guidelines.')
        .setColor('#FF0000')
        .addFields({ name: 'Spam Protection', value: 'Always Online' })
        .setFooter({ text: 'Continued violations may result in sanctions.' });

      await message.author.send({ content: "Do not spam! You are breaking the rules and violating the Community Guidelines.", embeds: [embed] });
      await message.delete();
    }

    // Check if the user exceeds the kick limit
    if (messageCounts[authorId].length > messageLimitKick) {
      const member = message.guild.members.cache.get(authorId);
      if (member) {
        await member.timeout(60000, "Too much spamming");
        await member.send("You have been muted for excessive spamming.");
      }
    }
  }

  if (message.content.includes("https://") || message.content.includes("http://")) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      message.delete();
      message.author.send("Your Message is deleted for Sharing Link or Advertising from Server.");
    }
  }

  if (filter) {
    const hasFilterWord = filterWords.some(word => message.content.toLowerCase().includes(word));
    if (hasFilterWord) {
      try {
        await message.delete();

        const userEmbed = new EmbedBuilder()
          .setTitle("Message Deleted")
          .setDescription("Your message has been filtered as it violates the Community Guidelines or uses prohibited text.\n\nUse of Bad Word: ||" + hasFilterWord + "||")
          .setColor("#FF0000"); // RED color in hex
        await message.author.send({ embeds: [userEmbed] });

        console.log("Message deleted successfully.");
      } catch (error) {
        if (error.code === 10008) {
          console.error("Error deleting message: Unknown Message (might be already deleted).");
        } else {
          console.error("Error deleting message:", error);
        }
      }
    }
  }

  if (command === '!help') {
    await message.channel.send(`
      **Command Help:**

      * !info-food <name, example: common/uncommon/rare/epic/legendary> - Get information about food items.
      * !buy-food <name, example: common/uncommon/rare/epic/legendary> - Purchase food items.
      * !buy <pet-tag> - Possibly purchase a pet using a tag.
      * !pet-feed - Feed your pet.
      * !pet-list - List your pets.
      * !pet - Get information about your pet.
      * !register-pet - Register a new pet.
      * !baltop - View a Baltop for registered pets.
      * !host | Create hosting for a text channel.
      * !host-voice | Create hosting for a voice channel.
      * !ticket-button | Create a ticket (Requires Manage Messages permission).
      * !rules | Generate rules for the Discord Server Community Guidelines.
      * !ticket-support | Support ticket information.
      * !news | Displays the latest news.
      * skunkapp&suggest | Submit a suggestion.
      * skunkapp!version | Display the current version.
      * skunkapp!latest-version | Display the latest version.
      * skunkapp!old-version | Display an old version.
      * !review | Create a review in the channel.
      * skunkapp!staff | Manage staff-related functions.
      * !mod-view | View moderation tools: Ban/Kick/View.
      * !react-me | React with emojis.
      * !cat | Display a picture of a kitten.
      * !money | Check your money.
      * !pet-hug | Hug your pet and earn money.
    `);
  }
}
);

function generateVerificationCode() {
  const code = Math.floor(10000 + Math.random() * 90000).toString();
  verificationCodes.set(code, true);
  return code;
}

client.on('guildMemberUpdate', (oldMember, newMember) => {
  if (oldMember.communicationDisabledUntil && !newMember.communicationDisabledUntil) {
    const index = muteUsers.indexOf(newMember.id);
    if (index > -1) {
      muteUsers.splice(index, 1);
      console.log(`${newMember.user.tag} has been unmuted.`);
    }
  }
});

const LOG_CHANNEL_NAMES = ['log', 'logs']; // List of possible log channel names

async function getLogChannel(guild) {
  for (const name of LOG_CHANNEL_NAMES) {
    const channel = guild.channels.cache.find(c => c.name === name);
    if (channel) {
      return channel;
    }
  }
  console.error('Log channel not found.');
  return null;
}

client.on('channelCreate', async (channel) => {
  const guild = channel.guild;
  const logChannel = await getLogChannel(guild);
  if (logChannel) {
    logChannel.send(`Channel created: **${channel.name}** (${channel.id})`).catch(console.error);
  }
});

client.on('channelDelete', async (channel) => {
  const guild = channel.guild;
  const logChannel = await getLogChannel(guild);
  if (logChannel) {
    logChannel.send(`Channel deleted: **${channel.name}** (${channel.id})`).catch(console.error);
  }
});

client.on('channelUpdate', async (oldChannel, newChannel) => {
  const guild = newChannel.guild;
  const logChannel = await getLogChannel(guild);
  if (logChannel) {
    logChannel.send(`Channel updated: **${oldChannel.name}** (${oldChannel.id})\nBefore: ${oldChannel}\nAfter: ${newChannel}`).catch(console.error);
  }
});

client.on('roleCreate', async (role) => {
  const guild = role.guild;
  const logChannel = await getLogChannel(guild);
  if (logChannel) {
    logChannel.send(`Role created: **${role.name}** (${role.id})`).catch(console.error);
  }
});

client.on('roleDelete', async (role) => {
  const guild = role.guild;
  const logChannel = await getLogChannel(guild);
  if (logChannel) {
    logChannel.send(`Role deleted: **${role.name}** (${role.id})`).catch(console.error);
  }
});

client.on('roleUpdate', async (oldRole, newRole) => {
  const guild = newRole.guild;
  const logChannel = await getLogChannel(guild);

  // Check if the updated role has the VIEW_AUDIT_LOG permission
  if (!newRole.permissions.has(PermissionsBitField.Flags.ViewAuditLog)) {
    console.error(`The role ${newRole.name} (${newRole.id}) does not have the VIEW_AUDIT_LOG permission.`);
    return;
  }

  if (logChannel) {
    logChannel.send(`Role updated: **${oldRole.name}** (${oldRole.id})\nBefore: ${oldRole.permissions.toArray().join(', ')}\nAfter: ${newRole.permissions.toArray().join(', ')}`).catch(console.error);
  }
});

client.on('messageDelete', async (message) => {
  const guild = message.guild;
  const logChannel = await getLogChannel(guild);
  if (logChannel) {
    logChannel.send(`Message deleted: **${message.content}** (${message.id})`).catch(console.error);
  }
});

client.login(token);
