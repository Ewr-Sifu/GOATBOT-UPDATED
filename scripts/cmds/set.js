module.exports = {
  config: {
    name: "set",
    aliases: ["ap"],
    version: "3.0",
    author: "SiFu",
    role: 2, 
    shortDescription: {
      en: "Advanced global economy controller"
    },
    longDescription: {
      en: "Set money or exp for users individually or globally (all users)."
    },
    category: "economy",
    guide: {
      en: "{pn} [money|exp] [amount] -> Set for self/reply/mention\n{pn} [money|exp] all [amount] -> Set for everyone"
    }
  },

  onStart: async function ({ args, event, api, usersData }) {
    const OWNER_IDS = ["100078859776449"]; // Permission list

    if (!OWNER_IDS.includes(event.senderID)) {
      return api.sendMessage(
        "😗 𝖠𝖢𝖢𝖤𝖲𝖲 𝖣𝖤𝖭𝖨𝖤𝖣: This command is restricted to bot developer ☠️.",
        event.threadID,
        event.messageID
      );
    }

    const { threadID, messageID, senderID } = event;
    const type = args[0]?.toLowerCase();

    // 💡 Help Message if no args
    if (!type || !["money", "exp"].includes(type)) {
      return api.sendMessage(
        "📑 𝖴𝖲𝖠𝖦𝖤 𝖦𝖴𝖨𝖣𝖤\n━━━━━━━━━━━━━\n" +
        "• set money [amount] -> (Reply/Mention/Self)\n" +
        "• set exp [amount] -> (Reply/Mention/Self)\n" +
        "• set money all [amount] -> (Global set)\n" +
        "• set exp all [amount] -> (Global set)",
        threadID, messageID
      );
    }

    // 🌍 Global Set Logic (Set All)
    if (args[1]?.toLowerCase() === "all") {
      const amount = Number(args[2]);
      if (isNaN(amount) || amount < 0) {
        return api.sendMessage("🍓 Please provide a valid amount for global update.", threadID, messageID);
      }

      const allUsers = await usersData.getAll();
      let count = 0;

      for (const user of allUsers) {
        await usersData.set(user.userID, {
          [type]: amount
        });
        count++;
      }

      return api.sendMessage(
        `🍓𝖦𝖫𝖮𝖡𝖠𝖫 𝖴𝖯𝖣𝖠𝖳𝖤 𝖲𝖴𝖢𝖢𝖤𝖲𝖲🍓\n━━━━━━━━━━━━━\n` +
        `📝 𝖳𝗒𝗉𝖾: ${type.toUpperCase()}\n` +
        `💰 𝖠𝗆𝗈𝗎𝗇𝗍: ${amount.toLocaleString()}\n` +
        `👥 𝖳𝖺𝗋𝗀𝖾𝗍: ${count} Users updated!`,
        threadID, messageID
      );
    }

    // 👤 Individual Set Logic
    let targetID;
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions || {}).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    } else {
      targetID = senderID;
    }

    const amount = Number(args[1]);
    if (isNaN(amount) || amount < 0) {
      return api.sendMessage("🍓 Please provide a valid number amount.", threadID, messageID);
    }

    const name = await usersData.getName(targetID);
    const userData = await usersData.get(targetID);

    if (!userData) return api.sendMessage("🍓 User not found in database.", threadID, messageID);

    await usersData.set(targetID, {
      [type]: amount
    });

    return api.sendMessage(
      `🍓 𝖣𝖠𝖳𝖠 𝖬𝖮𝖣𝖨𝖥𝖨𝖤𝖣 🍓\n━━━━━━━━━━━━━\n` +
      `👤 𝖴𝗌𝖾𝗋: ${name}\n` +
      `📝 𝖳𝗒𝗉𝖾: ${type.toUpperCase()}\n` +
      `💵 𝖭𝖾𝗐 𝖵𝖺𝗅𝗎𝖾: ${amount.toLocaleString()}`,
      threadID, messageID
    );
  }
};
