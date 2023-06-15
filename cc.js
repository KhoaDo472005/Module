const axios = require("axios");
module.exports = {
  config: {
    name: "imagine",
    aliases: [""],
    version: "1.0.0",
    author: "",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "Tạo ảnh từ văn bản của bạn",
      en: "Create image from your text"
    },
    longDescription: {
      uid: "Tạo ảnh từ văn bản của bạn",
      en: "Create image from your text"
    },
    category: "AI",
    guide: {
      vi: "   {pn} <prompt>: tạo ảnh từ văn bản của bạn"
        + "\n    Ví dụ: {pn}imagine a gta style house, gta, 4k, hyper detailed, cinematic, realistic, unreal engine, cinematic lighting, bright lights"
    }
  },

  langs: {
    vi: {
      syntaxError: "⚠️ Vui lòng nhập mô tả!",
      error: "❗ Đã có lỗi xảy ra, vui lòng thử lại sau:\n%1",
      serverError: "❗ Server đang quá tải, vui lòng thử lại sau",
      invalid: "⚠️ Lựa chọn không hợp lệ!"
    },
    en: {
      syntaxError: "⚠️ Please enter prompt",
      error: "❗ An error has occurred, please try again later:\n%1",
      serverError: "❗ Server is overloaded, please try again later",
      invalid: "⚠️ Invalid choosen, please try again!"
    }
  },

  onStart: async function ({ message, args, getLang }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply(getLang("syntaxError"));
    message.reply({
      body: "Chọn style cho ảnh của bạn:\n1. Anime\n2. Robot",
      attachment: []
    }, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        messageID: info.messageID,
        author: event.senderID,
        type: "chooseStyle",
        prompt: prompt
      });
    });
  }
  
  onReply: async ({ message, Reply, event, getLang, envCommands, commandName }) => {
    const { author, prompt, messageID, type } = Reply;
    if (event.senderID != author) return;
    if (type == "chooseStyle") {
      var style = parseInt(event.body);
      var styleID = {"n1": 21, "n2": 28};
      if(!styleID['n'+style]) return message.reply(getLang("invalid"));
      global.GoatBot.onReply.delete(messageID);
      return message.reply({
        body: "Chọn tỉ lệ cho ảnh của bạn:\n1. 1:1\n2. 3:4\n3. 4:3\n4. 9:16",
        attachment: []
      }, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          type: "chooseRatio",
          prompt: prompt,
          style: styleID['n'+style]
        });
      });
    }
    if (type == "chooseRatio") {
      var ratio = {"n1": "1:1", "n2": "3:4", "n3": "4:3", "n4": "9:16"}
      var num = parseInt(event.body);
      if(!ratio['n'+num]) return message.reply(getLang("invalid"));
      global.GoatBot.onReply.delete(messageID);
      try {
        const { data: imageStream } = await axios({
          url: "https://goatbotserver.onrender.com/taoanhdep/texttoimage",
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          data: {
            prompt,
            styleId: Reply.style,
            aspect_ratio: ratio['n'+num]
          },
          responseType: "stream"
        });
        imageStream.path = "image.png";
        return message.reply({
          attachment: imageStream
        });
      } catch (err) {
        return message.reply(getLang("error", err.response?.data?.message || err.message));
      }
    }

  }
};
