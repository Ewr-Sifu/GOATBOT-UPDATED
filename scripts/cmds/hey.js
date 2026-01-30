const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "hey",
    aliases: [],
    version: "1.0",
    author: "SIFU",
    countDown: 10,
    role: 0,
    shortDescription: {
      vi: "",
      en: ""
    },
    longDescription: {
      vi: "",
      en: "𝙋𝙚𝙧𝙨𝙤𝙣𝙖𝙡 𝙄𝙣𝙩𝙚𝙡𝙡𝙞𝙜𝙚𝙣𝙘𝙚 with voice response [ NOT SUITABLE FOR COMPLEX QUERIES ]"
    },
    category: "voice ai",
    guide: {
      en: "{pn} 'query'\nexample:\n{pn} hi there"
    }
  },
  onStart: async function ({ api, message, event, args, commandName }) {
    const userID = event.senderID;
    let query = encodeURIComponent(args.join(" "));
    if (!query) {
      message.reply("Please provide a query. \n\nExample: /pi hey buddy ");
      return;
    }



    try {
      message.reaction("⚡", event.messageID);
      const response = await axios.get(`https://simoai-llmapi.onrender.com/pi/generate?prompt=${query}&id=${userID}&apikey=gotohellgays`);

      const answer = response.data.answer;
      const audio = response.data.audioUrl;
      const stream = await getStreamFromURL(audio);
      await message.reaction("🍓", event.messageID);

      if (answer) {
        message.reply(
          {
            body: `🍓🍓🍓`,
            attachment: stream
          },
          
          (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              author: event.senderID
            });
          }
        );
      } else {
        console.error("Invalid API Response:", response.data);
        sendErrorMessage(message, "Server response is invalid ❌");
      }
    } catch (error) {
      console.error("Request Error:", error);
      sendErrorMessage(message, "Server not responding ❌");
    }
  },
  onReply: async function ({ message, event, Reply, args }) {
    let { author, commandName } = Reply;
    if (event.senderID !== author) return;

    if (args[0].toLowerCase() === "clear") {
      try {
        const userID = author;
        const response = await axios.get(`https://simoai-llmapi.onrender.com/pi/generate?prompt=clear&id=${userID}&apikey=gotohellgays`);

        
      } catch (error) {
        console.error("Request Error:", error);
        sendErrorMessage(message, "Server not responding ❌");
      }
      global.GoatBot.onReply.delete(message.messageID);
      
    }

    const userID = author;
    const query = encodeURIComponent(args.join(" "));

    try {
      message.reaction("⚡", event.messageID);
      const response = await axios.get(`https://simoai-llmapi.onrender.com/pi/generate?prompt=${query}&id=${userID}&apikey=gotohellgays`);

      const answer = response.data.answer;
      const audio = response.data.audioUrl;
      const stream = await getStreamFromURL(audio);
     message.reaction("🍓", event.messageID);

      if (answer) {
        message.reply(
          {
            body: `🍓🍓🍓`,
            attachment: stream
          },
          
          (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              author: event.senderID
            });
          }
        );
      } else {
        console.error("Invalid API Response:", response.data);
        sendErrorMessage(message, "Server response is invalid ❌");
      }
    } catch (error) {
      console.error("Request Error:", error);
      sendErrorMessage(message, "Server not responding ❌");
    }
    global.GoatBot.onReply.delete(message.messageID);
  }
};

function sendErrorMessage(message, errorMessage) {
  message.reply({ body: errorMessage });
}
