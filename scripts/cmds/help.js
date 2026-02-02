// --- Maps for fonts ---
const smallCapsMap = {
  a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ', f:'ꜰ',
  g:'ɢ', h:'ʜ', i:'ɪ', j:'ᴊ', k:'ᴋ', l:'ʟ',
  m:'ᴍ', n:'ɴ', o:'ᴏ', p:'ᴘ', q:'ǫ', r:'ʀ',
  s:'ꜱ', t:'ᴛ', u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x',
  y:'ʏ', z:'ᴢ'
};

const cmdFontMap = {
  ...smallCapsMap,
  '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴',
  '5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'
};

const toSmallCaps = t =>
  t.toLowerCase().split("").map(c => smallCapsMap[c] || c).join("");

const toCmdFont = t =>
  t.toLowerCase().split("").map(c => cmdFontMap[c] || c).join("");

module.exports = {
  config: {
    name: "help",
    aliases: ["menu"],
    version: "6.0",
    author: "𝐒𝐈𝐅𝐀𝐓",
    shortDescription: "Show all available commands",
    longDescription: "Displays a categorized command list.",
    category: "system",
    guide: "{pn}help [command name]"
  },

  onStart: async function ({ message, args, prefix }) {
    const allCommands = global.GoatBot.commands;
    const categories = {};

    // --- Clean category name ---
    const cleanCategoryName = (text) => {
      if (!text) return "OTHERS";
      return text
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();
    };

    // --- Organize commands ---
    for (const [, cmd] of allCommands) {
      if (!cmd?.config || cmd.config.name === "help") continue;
      const cat = cleanCategoryName(cmd.config.category);
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd.config.name);
    }

    // --- Single command detail ---
    if (args[0]) {
      const query = args[0].toLowerCase();

      const cmd =
        allCommands.get(query) ||
        [...allCommands.values()].find(c =>
          (c.config?.aliases || []).map(a => a.toLowerCase()).includes(query)
        );

      if (!cmd || !cmd.config) {
        return message.reply(`❌ Command "${query}" not found.`);
      }

      const {
        name,
        version,
        author,
        guide,
        category,
        shortDescription,
        longDescription,
        aliases
      } = cmd.config;

      const desc =
        typeof longDescription === "string"
          ? longDescription
          : longDescription?.en ||
            shortDescription?.en ||
            shortDescription ||
            "No description";

      const usage =
        (typeof guide === "string"
          ? guide
          : guide?.en || `{pn}${name}`)
          .replace(/{pn}/g, prefix)
          .replace(/{name}/g, name);

      // Removed attachment property
      return message.reply(
          `🌸 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢 🌸\n\n` +
          `🎀 Name: ${name}\n\n` +
          `🎀 Category: ${category || "Uncategorized"}\n\n` +
          `🎀 Description: ${desc}\n\n` +
          `🎀 Aliases: ${aliases?.length ? aliases.join(", ") : "None"}\n\n` +
          `🎀 Usage: ${usage}\n\n` +
          `🎀 Version: ${version || "1.0"}`
      );
    }

    // --- Full help list ---
    let msg = "┍━━━━━━━━━━━━━━━𒐬\n┋ 𓊈🍓—͟͟͞͞𝐒𝐈𝐙𝐔 𝐂𝐌𝐃𝐒~緒🍓𓊉\n┕━━━━━━━━━━━━━━━𒐬\n\n\n";
    const sortedCategories = Object.keys(categories).sort();

    for (const cat of sortedCategories) {
      msg += `╭━━━𓊈 🍁 ${toSmallCaps(cat)} 𓊉\n`;
      const commands = categories[cat].sort();
      for (let i = 0; i < commands.length; i += 2) {
        const a = toCmdFont(commands[i]);
        const b = commands[i + 1] ? toCmdFont(commands[i + 1]) : null;
        msg += b ? `┋⌬ ${a}   ⌬ ${b}\n` : `┋⌬ ${a}\n`;
      }
      msg += `┕━━━━━━━━━━━━𒐬\n\n`;
    }

    msg +=
      `┍━━━━━━━━━━━━━━━𒐬\n` +
      ` 𓊈🎀𓊉 ᴛᴏᴛᴀʟ ᴄᴏᴍᴍᴀɴᴅꜱ: ${allCommands.size - 1}\n` +
      ` 𓊈🔑𓊉 ᴘʀᴇꜰɪx: ${prefix}\n` +
      ` 𓊈👑𓊉 ᴏᴡɴᴇʀ: SiZu BBy 🍓\n` +
      `┕━━━━━━━━━━━━━━━𒐬`;

    // Removed attachment property
    return message.reply(msg);
  }
};
