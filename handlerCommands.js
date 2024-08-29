const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, token } = require('./config.json');

const rest = new REST({ version: '9' }).setToken(token);

async function registerCommands(guildId) {
  try {
    const commands = [
      {
        name: 'mod-ban', // Command name
        description: 'Moderation: Uses from the Ban Members. (Requires Ban Members of Permission.)', // Description
        options: [
          {
            type: 6,
            name: 'user',
            description: 'Select the User to Ban',
            required: true
          },
          {
            type: 3,
            name: 'reason',
            description: 'Type the Reason of the Ban',
            required: true
          },
          {
            type: 5,
            name: 'can-appeal',
            description: 'The User can appeal the ban.',
            required: true
          }
        ]
      },
      {
        name: 'mod-kick', // Command name
        description: 'Moderation: Uses from the Kick Members. (Requires Kick Members of Permission)', // Description
        options: [
          {
            type: 6,
            name: "user",
            description: "Select the User to Kick",
            required: true
          },
          {
            type: 3,
            name: "reason",
            description: "Type the Reason of the Kick",
            required: true
          }
        ]
      },
      {
        name: 'feedback', // Command name
        description: 'Support: Send feedback', // Description should be between 1 and 100 characters
        options: [
          {
            type: 3, // STRING type
            name: 'message',
            description: 'Write the feedback message to send to SkunkPlatform. Use {line} for new lines.', // Ensure this description is within the length limit
            required: true
          }
        ]
      },
      {
        name: "dm",
        description: "Send a Direct Message to a User (Just requires Manage Messages)",
        options: [
          {
            type: 6,
            name: "user",
            description: "Type the User to Send the Direct Message (Required Option)",
            required: true
          },
          {
            type: 3,
            name: "message",
            description: "The Message can be viewed (Required Option)",
            required: true
          }
        ]
      },
      {
        name: "announce-moderator",
        description: "Send a Announce from moderator-only (Only can be announced by Bot's Owner)",
        options: [
          {
            type: 3,
            name: "message",
            description: "Send a Announce from Message (Required Option)",
            required: true
          }
        ]
      },
      {
        name: "hackreport",
        description: "Report user for hacking.",
        options: [
          {
            type: 3, // STRING
            name: "username",
            description: "Enter the username or mention the user",
            required: true
          },
          {
            type: 3, // STRING
            name: "reason",
            description: "Select the reason for reporting",
            required: true,
            choices: [
              { name: "Hacking Profile or Hacked Account (GD)", value: "Hacking Profile or Hacked Account (GD)" },
              { name: "Hacking Other Levels or Completing Level with Hacks (GD)", value: "Hacking Other Levels or Completing Level with Hacks (GD)" },
              { name: "Hacking in Minecraft", value: "Hacking in Minecraft" },
              { name: "Hacking in Roblox", value: "Hacking in Roblox" },
              { name: "Hacking in Fortnite", value: "Hacking in Fortnite" },
              { name: "Hacking in Among Us", value: "Hacking Among Us" },
              { name: "Other Hacking", value: "Other Hacking" },
              { name: "Hacking Discord Server", value: "Hacking Discord Server" },
              { name: "Phishing Attempts", value: "Phishing Attempts" },
              { name: "Exploit Usage", value: "Exploit Usage" },
              { name: "Account Theft", value: "Account Theft" }
            ]
          },
          {
            type: 3, // STRING
            name: "message",
            description: "Provide details for moderators to review",
            required: true
          }
        ]
      },
      {
        name: "chatreport",
        description: "Report user for inappropriate chat behavior.",
        options: [
          {
            type: 3, // STRING
            name: "username",
            description: "Enter the username or mention the user",
            required: true
          },
          {
            type: 3, // STRING
            name: "reason",
            description: "Select the reason for reporting",
            required: true,
            choices: [
              { name: "Inappropriate Language", value: "Innapropiate Language" },
              { name: "Spamming", value: "Spammings" },
              { name: "Bad Words", value: "Bad Words" },
              { name: "Sharing Links or Ad Links", value: "Links or Advertising Links" },
              { name: "Harassment or Bullying", value: "Harassment or Bullying" },
              { name: "Impersonation", value: "Impersonation" },
              { name: "Threats or Violence", value: "Threats or Violence" },
              { name: "Toxic Behavior", value: "Toxic Behavior" },
              { name: "Other", value: "Other" }
            ]
          },
          {
            type: 3, // STRING
            name: "message",
            description: "Provide details for moderators to review",
            required: true
          }
        ]
      },
      {
        name: "add-filter",
        description: "Add a Filter.",
        options: [
          {
            type: 3,
            name: "filter-word",
            description: "Write the Filter Word to make Secure",
            required: true
          }
        ]
      },
      {
        name: "delete-filter",
        description: "Deletes a Filter (Requires Developer Bot)",
        options: [
          {
            type: 3,
            name: "filter-word",
            description: "Write the Word Filter to Remove this Filter",
            required: true
          }
        ]
      },
      {
        name: 'review',
        description: 'Create an invite link for a specified channel.',
        options: [
          {
            type: 7,
            name: 'channel',
            description: 'The channel to create an invite for.',
            required: true
          }
        ]
      },
      {
        name: "report",
        description: "It allows members to report this user.",
        options: [
          {
            type: 3, // STRING
            name: "username",
            description: "Enter the username or mention the user (Required)",
            required: true
          },
          {
            type: 3, // STRING
            name: "reason",
            description: "Enter the Reason (Required)",
            required: true
          },
          {
            type: 3, // STRING
            name: "message",
            description: "Enter the Message (Optional)",
            required: false
          }
        ]
      },
      {
        name: 'send-message-guild',
        description: 'Send a message to a specific channel in a guild',
        options: [
          {
            type: 3, // STRING type
            name: 'guildid',
            description: 'The ID of the guild',
            required: true,
          },
          {
            type: 7, // CHANNEL type
            name: 'channel',
            description: 'The channel to send the message to',
            required: true,
          },
          {
            type: 3, // STRING type
            name: 'message',
            description: 'The message to send',
            required: true,
          },
        ],
      },
      {
        name: 'skunk',
        description: 'Coming Soon!'
      },
      {
        name: 'skunk-mod',
        description: 'Coming Soon!'
      },
      {
        name: 'skunk-moderate',
        description: 'Coming Soon!'
      },
      {
        name: 'skunk-safety',
        description: 'Coming Soon!'
      },
      {
        name: 'skunkplatform-about',
        description: 'Coming Soon!'
      },
      {
        name: 'create-support',
        description: 'Create a support ticket.',
        options: [{
          name: 'msg',
          type: 3, // 3 is the type for string
          description: 'The content of the support ticket',
          required: true
        }]
      },
      {
        name: 'disable-safe-guild',
        description: 'Disable the Server Channel\'s Protection guild functionality for this guild.'
      },
      {
        name: 'mod-tempban',
        description: 'Temporarily bans a user from the server for a specified duration.',
        options: [
          {
            name: 'user',
            type: 6,  // Type 6 corresponds to USER
            description: 'The user to temporarily ban.',
            required: true
          },
          {
            name: 'duration',
            type: 3,  // Type 3 corresponds to STRING
            description: 'The duration of the ban (e.g., 1h, 30m, 1d).',
            required: true
          },
          {
            name: 'reason',
            type: 3,  // Type 3 corresponds to STRING
            description: 'The reason for the temporary ban.',
            required: false
          }
        ],
      },
      {
        name: "custom-welcome",
        description: "Set a custom welcome message and channel.",
        options: [
          {
            type: 7, // CHANNEL type
            name: 'channel',
            description: 'The channel where the welcome message will be sent',
            required: true,
          },
          {
            type: 3, // STRING type
            name: 'welcome-text',
            description: 'The custom welcome message with {user} placeholder',
            required: true,
          },
        ],
      },
      {
        name: "custom-leave",
        description: "Set a custom leave message and channel.",
        options: [
          {
            type: 7, // CHANNEL type
            name: 'channel',
            description: 'The channel where the leave message will be sent',
            required: true,
          },
          {
            type: 3, // STRING type
            name: 'leave-text',
            description: 'The custom leave message with {user} placeholder',
            required: true,
          },
        ],
      },
      {
        name: "get-reviewer",
        description: "Nope!"
      },
      {
        name: 'create-embed',
        description: 'Create and send an embed message to a specified channel.',
        options: [
          {
            type: 7, // CHANNEL
            name: 'channel',
            description: 'The channel to send the embed to.',
            required: true
          },
          {
            type: 3, // STRING
            name: 'embedtitle',
            description: 'Title of the embed.',
            required: true
          },
          {
            type: 3, // STRING
            name: 'embeddescription',
            description: 'Description of the embed. Use `{user}`, `{line}`, `{b="text"}`, `{i="text"}`, `{userTo=uid}`.',
            required: true
          },
          {
            type: 3, // STRING
            name: 'embedcolor',
            description: 'Embed color in hex format (e.g., #0099ff).'
          },
          {
            type: 3, // STRING
            name: 'embedimage',
            description: 'URL of an image to include in the embed.'
          },
          {
            type: 3, // STRING
            name: 'content',
            description: 'Optional content to include with the embed.'
          }
        ]
      },
      {
        name: 'reply-message',
        description: 'Replies to a specific message with content.',
        options: [
          { type: 3, name: 'message-id', description: 'The ID of the message to reply to', required: true }, // String: Message ID
          { type: 3, name: 'content', description: 'The content of the reply', required: true } // String: Content of the reply
        ],
      },
      {
        name: 'revoke-ban',
        description: 'Revokes a ban from a specific user.',
        options: [
          { type: 6, name: 'user', description: 'The user to revoke the ban from', required: true } // User: User to revoke ban
        ],
      },
      {
        name: "get-information",
        description: "Fetches and sends your Discord information via DM." // Descripción del comando
      },
      {
        name: 'suspend-pet',
        description: 'Suspends the pet of a specified user. Developer access required.',
        options: [
          { type: 6, name: 'user', description: 'The user whose pet will be suspended', required: true } // User: User whose pet will be suspended
        ],
      },
      {
        name: 'delete-pet',
        description: 'Deletes the pet of a specified user. Developer access required.',
        options: [
          { type: 6, name: 'user', description: 'The user whose pet will be deleted', required: true } // User: User whose pet will be deleted
        ],
      },
      {
        name: 'create-message-thread',
        description: 'Creates a new thread in a message.',
        options: [
          {
            type: 3, // STRING type
            name: 'message-id',
            description: 'The ID of the message to create the thread in.',
            required: true,
          },
          {
            type: 3, // STRING type
            name: 'thread-name',
            description: 'The name of the thread.',
            required: true,
          }
        ]
      },
      {
        name: 'create-thread',
        description: 'Creates a new thread in a channel.',
        options: [
          {
            type: 3, // STRING type
            name: 'channel-id',
            description: 'The ID of the channel to create the thread in.',
            required: true,
          },
          {
            type: 3, // STRING type
            name: 'thread-name',
            description: 'The name of the thread.',
            required: true,
          }
        ]
      },
      {
        name: 'Profile',
        type: 2
      },
      {
        name: "skunkapp-settings",
        description: "Opens the Bot for SkunkAPP. (Developers-Only)",
        type: 1
      },
      /*
      {
        name: 'mod-view',
        description: 'View moderation actions for a mentioned user.',
        options: [
          {
            type: 6, // USER type
            name: 'user',
            description: 'The user to view moderation actions for.',
            required: true,
          }
        ]
      },
      {
    name: 'create-embed-advanced',
    description: 'Creates an advanced embed message with customizable options.',
    options: [
      { type: 3, name: 'title', description: 'The title of the embed', required: true }, // String: The title of the embed
      { type: 3, name: 'description', description: 'The description of the embed', required: true }, // String: The description of the embed
      { type: 3, name: 'footer', description: 'The footer text of the embed' }, // String: Footer of the embed
      { type: 3, name: 'image', description: 'The URL of the image to be included in the embed' }, // String: URL of the image
      { type: 3, name: 'thumbnail', description: 'The URL of the thumbnail for the embed' }, // String: URL of the thumbnail
      { type: 3, name: 'color', description: 'The color of the embed in hex format (e.g., #FF5733)' }, // String: Color of the embed
      { type: 3, name: 'author_name', description: 'The name of the author of the embed' }, // String: Name of the author
      { type: 3, name: 'author_icon', description: 'The URL of the icon for the author' }, // String: URL of the author’s icon
      { type: 5, name: 'timestamp', description: 'Whether to include a timestamp in the embed' }, // Boolean: Whether to add a timestamp
      { type: 3, name: 'fields', description: 'Additional fields for the embed in JSON format (e.g., [{"name": "Field1", "value": "Value1"}])' } // String: JSON formatted fields
    ],
  },
  {
    name: 'create-message',
    description: 'Creates a simple message in a specified channel.',
    options: [
      { type: 7, name: 'channel', description: 'The channel to send the message to', required: true }, // Channel: Channel to send the message
      { type: 3, name: 'content', description: 'The content of the message', required: true } // String: Content of the message
    ],
  },
  {
    name: 'reply-message-advanced',
    description: 'Replies to a specific message with optional embeds and attachments.',
    options: [
      { type: 3, name: 'message-id', description: 'The ID of the message to reply to', required: true }, // String: Message ID
      { type: 3, name: 'embeds', description: 'Optional embeds for the reply' }, // String: Optional embeds
      { type: 11, name: 'attachment', description: 'Optional attachment for the reply' } // Attachment: Optional attachment
    ],
  },
      */
    ];

    const requestBody = {
      body: commands
    };

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      requestBody
    );
  } catch (error) {
    console.error(error);
  }
}

module.exports = { registerCommands };
