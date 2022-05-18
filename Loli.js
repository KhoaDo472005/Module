const moneydown = 1000 // Số tiền cho mỗi ảnh

const path = __dirname + '/cache/loli.jpg';

module.exports.config = {
  name: "loli", // FBI open up =))
  version: "1.0.0",
  hasPermssion: 0,
  credits: " ",
  description: `Random ảnh loli kawaii, mỗi ảnh tốn ${moneydown}$ ^^`,
  commandCategory: "Hình ảnh",
  usages: "",
  cooldowns: 0
};

module.exports.run = async function({ api, event, Currencies }) {
	
  const fs = require("fs");
  const axios = require("axios");
  
  var data = await Currencies.getData(event.senderID);
  var money = data.money;
  if(money < moneydown) return api.sendMessage(`Bạn không có đủ ${moneydown}$ để xem ảnh, vui lòng theo thầy Huấn làm ăn bươn chải!`, event.threadID, event.messageID);
  
  const res = axios.get("https://api-random-img.doanhkhoa.repl.co/loli");
  let count = res.data.count;
  var down = (await axios.get(`${res.data.data}`, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(path, Buffer.from(down, "utf-8")); 
	
  Currencies.decreaseMoney(event.senderID, moneydown);
  return api.sendMessage({
    body: `Loli đây :>  -${moneydown}$\nHiện có ${count} ảnh!`,
    attachment: fs.createReadStream(path)
  }, event.threadID, () => fs.unlinkSync(path), event.messageID);
}
