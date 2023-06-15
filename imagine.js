const axios = require("axios");
const api = "https://web.duongkum999.tech/ai";
const getImage = async url => (await axios.get(url, { responseType: "stream" })).data;

module.exports.config = {
  name: "imagine",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Khoa",
  description: "TRình tạo nghệ thuật AI",
  commandCategory: "AI",
  usages: "[mô tả]",
  cooldowns: 0
};

module.exports.run = async function ({ api, event, args }) {
  var { threadID, messageID, senderID } = event;
  var {sendMessage: send, unsendMessage: unsend} = api;
  if (args.length == 0) return send("Vui lòng nhập mô tả!", threadID, messageID);
  return send("Chọn style cho ảnh của bạn:\n1. Anime\n2. Robot", threadID, (error, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: senderID,
      type: "chooseStyle",
      prompt: args.join(" ")
    })
  }, messageID);
}

module.exports.handleReply = async function ({ event, api, handleReply }) {
  var {sendMessage: send, unsendMessage: unsend} = api;
  var {threadID: tid, messageID: mid, senderID: sid } = event;
  if (sid !== handleReply.author) return;
  if (handleReply.type == "chooseStyle") {
    var style = parseInt(event.body);
    var styleID = {"s1": 21, "s2": 28};
    if(!styleID['s'+style]) return send("Lựa chọn không hợp lệ!", tid, mid);
    unsend(handleReply.messageID);
    return send("Chọn tỉ lệ cho ảnh của bạn:\n1. 1:1\n2. 3:4\n3. 4:3\n4. 9:16\n5. 16:9", tid, (error, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: sid,
        type: "chooseRatio",
        prompt: handleReply.prompt,
        style: styleID['s'+style]
      })
    }, mid);
  }
  if (handleReply.type == "chooseRatio") {
    var ratio = {"r1": "1:1", "r2": "3:4", "r3": "4:3", "r4": "9:16", "r5": "16:9"};
    var num = parseInt(event.body);
    if(!ratio['r'+num]) return send("Lựa chọn không hợp lệ!", tid, mid);
    try {
      unsend(handleReply.messageID);
      var text = "Reaction để tiếp tục tạo!";
      return send({ body: text, attachment: await getImage(api + `?prompt=${handleReply.prompt}&styleId=${handleReply.style}&aspect_ratio=${ratio['r'+num]}`)}, tid, (error, info) => {
        global.client.handleReaction.push({
          name: this.config.name,
          messageID: info.messageID,
          author: sid,
          prompt: handleReply.prompt,
          style: handleReply.style,
          ratio: ratio['r'+num]
        })
      }, mid);
    } catch (error) {
      return send(`Đã xảy ra lỗi!\nThả icon vào tin nhắn này để thử lại`, tid, (error, info) => {
        global.client.handleReaction.push({
          name: this.config.name,
          messageID: info.messageID,
          author: sid,
          prompt: handleReply.prompt,
          style: handleReply.style,
          ratio: ratio['r'+num]
        })
      }, mid);
    }
  }
}

module.exports.handleReaction = async({ api, event, handleReaction }) => {
  var {threadID: tid, messageID: mid, userID: uid } = event;
  if (uid != handleReaction.author) return;
  try {
    var text = "Reaction để tiếp tục tạo!";
    return send({ body: text, attachment: await getImage(api + `?prompt=${handleReaction.prompt}&styleId=${handleReaction.style}&aspect_ratio=${handleReaction.ratio}`)}, tid, (error, info) => {
      global.client.handleReaction.push({
        name: this.config.name,
        messageID: info.messageID,
        author: uid,
        prompt: handleReaction.prompt,
        style: handleReaction.style,
        ratio: handleReaction.ratio
      })
    }, mid);
  } catch (error) {
    return send(`Đã xảy ra lỗi!\nThả icon vào tin nhắn này để thử lại`, tid, (error, info) => {
      global.client.handleReaction.push({
        name: this.config.name,
        messageID: info.messageID,
        author: uid,
        prompt: handleReaction.prompt,
        style: handleReaction.style,
        ratio: handleReaction.ratio
      })
    }, mid);
  }
}
