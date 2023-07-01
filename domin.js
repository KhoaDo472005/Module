module.exports.config = {
  name: "domin", // minesweeper
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Khoa x Nam",
  description: "Dò mìn",
  commandCategory: "Game",
  usages: "",
  cooldowns: 0
};

const axios = require("axios");
const fs = require("fs-extra");
const dirpath = __dirname + `/domin/`;
const { loadImage, createCanvas } = require("canvas");
var texthelp = "Hướng dẫn:\n" +
"1. Bảng chơi được chia thành 70 ô nhỏ, các ô không gần mìn sẽ được đào sẵn.\n"+
"2. Nếu đào trúng ô có mìn, trò chơi kết thúc và người chơi thua. Nếu đào ô không có mìn, ô đó sẽ hiển thị số lượng ô có mìn xung quanh nó.\n" +
"3. Dựa vào các con số này, người chơi phải suy luận vị trí của các ô có mìn và đánh dấu chúng.\n" +
"4. Người chơi sẽ chiến thắng khi đào hết các ô không có mìn hoặc đánh dấu đúng các ô có mìn.\n" +
"5. Tương tác với trò chơi bằng cú pháp: <hành động> <tọa độ>\n" +
"Vd: 1 e5 f3 (đào 2 ô có tọa độ E5, F3 lên)."

async function draw(map,id) {
  const canvas = createCanvas(1200, 1000);
  const ctx = canvas.getContext('2d');
  if (fs.existsSync(dirpath + "avt" + id + ".png")) await loadAvt(id);
  var avatar = await loadImage(dirpath + "avt" + id + ".png");
  ctx.drawImage(avatar, 520, 10, 160, 160);
  var background = await loadImage("https://raw.githubusercontent.com/KhoaDo472005/minesweeper/main/board.png");
  ctx.drawImage(background, 0, 0, 1200, 1000);
  var texture1 = await loadImage("https://raw.githubusercontent.com/KhoaDo472005/minesweeper/main/texture1.png");
  var texture2 = await loadImage("https://raw.githubusercontent.com/KhoaDo472005/minesweeper/main/texture2.png");
  var co = await loadImage("https://raw.githubusercontent.com/KhoaDo472005/minesweeper/main/co.png");
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 7; j++) {
      const o = map[i][j];
      if (o.opened) {
        ctx.drawImage(texture2, 100+100*i, 800-100*j, 100, 100);
        if (o.isMine) {
          var mine = await loadImage("https://raw.githubusercontent.com/KhoaDo472005/minesweeper/main/bomb.png");
          ctx.drawImage(mine, 100+100*i, 800-100*j, 100, 100);
        } else {
          var number = await loadImage(`https://raw.githubusercontent.com/KhoaDo472005/minesweeper/main/no${o.adjacentMines}.png`);
          ctx.drawImage(number, 100+100*i, 800-100*j, 100, 100);
        }
	  } else {
        ctx.drawImage(texture1, 100+100*i, 800-100*j, 100, 100);
        if (o.markked) ctx.drawImage(co, 100+100*i, 800-100*j, 100, 100);
      }
    }
  }
  var path = dirpath + id + ".png";
  fs.writeFileSync(path, canvas.toBuffer("image/png"));
  return path;
}

function delData(id) {
  if (fs.existsSync(dirpath + id + ".json")) fs.unlinkSync(dirpath + id + ".json");
  if (fs.existsSync(dirpath + id + ".png")) fs.unlinkSync(dirpath + id + ".png");
  if (fs.existsSync(dirpath + "avt" + id + ".png")) fs.unlinkSync(dirpath + "avt" + id + ".png");
  return;
}

async function loadAvt(id) {
  var image = (await axios.get(`https://nams.live/avatar_ufb/${id}/512_512.jpg`, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(dirpath + "avt" + id + ".png", Buffer.from(image, "utf-8"));
}

async function createMap(numberOfMines) {
  const map = [];
  for (let i = 0; i < 10; i++) {
    const row = [];
    for (let j = 0; j < 7; j++) {
      row.push({
        opened: false,
        isMine: false,
        markked: false,
        adjacentMines: 0
     });
    }
    map.push(row);
  }
  map[0][0].complete = 0;
  map[0][0].flag = 0;
  map[0][0].mode = numberOfMines;
  let minesCount = 0;
  while (minesCount < numberOfMines) {
    const x = Math.floor(Math.random() * 10);
    const y = Math.floor(Math.random() * 7);
    if (!map[x][y].isMine) {
      map[x][y].isMine = true;
      minesCount++;
    }
  }
  const directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1]
  ];
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 7; j++) {
      if (!map[i][j].isMine) {
        let count = 0;
        for (let k = 0; k < directions.length; k++) {
          const [dx, dy] = directions[k];
          const newX = i + dx;
          const newY = j + dy;
          if (newX >= 0 && newX < 10 && newY >= 0 && newY < 7 && map[newX][newY].isMine) count++; 
        }
        map[i][j].adjacentMines = count;
      }
    }
  }
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 7; j++) {
      if (map[i][j].adjacentMines == 0 && !map[i][j].isMine) {map[i][j].opened = true ; map[0][0].complete += 1}
    }
  }
  return map;
}

module.exports.onLoad = () => {
  if (!fs.existsSync(dirpath)) fs.mkdirSync(dirpath);
}

module.exports.run = async function ({ api, event }) {
  var { threadID, messageID, senderID } = event;
  var choose = ["1", "2"];
  var text = "Reply lựa chọn!\n1. Chơi mới\n2. Hướng dẫn";
  if (fs.existsSync(dirpath + senderID + ".json")) { choose.push("3"); text += "\n3. Chơi tiếp" }
  return api.sendMessage(text, threadID, (error, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: senderID,
      invalidC: choose,
      type: "procedure"
    })
  }, messageID)
}

module.exports.handleReply = async function ({ event, api, handleReply}) {
  var {sendMessage: send, unsendMessage: unsend} = api;
  var {threadID: tid, messageID: mid, senderID: sid, args} = event;
 try {
  if (sid !== handleReply.author) return;
  if (handleReply.type == "newgame") {
    var mode = parseInt(event.body);
    if (![1,2,3].includes(mode)) return send("❌ Lựa chọn không hợp lệ!", tid, mid);
    unsend(handleReply.messageID);
    send("Đang tạo...",tid,mid);
    var mine = 5 + 5*mode;
    var map = await createMap(mine);
    while (map[0][0].complete = 0) {map = await createMap(mine)}
    await loadAvt(sid);
    fs.writeFileSync(dirpath+`${sid}.json`, JSON.stringify(map, null, 2));
    return send({body:"1. Đào lên\n2. Đánh dấu\n3. Bỏ đánh dấu\nVd: 1 E5 (đào ô E5)", attachment: fs.createReadStream(await draw(map, sid))}, tid, (error, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: sid,
        type: "play"
      })
    }, mid);
  }
  if (handleReply.type == "procedure") {
    if (!handleReply.invalidC.includes(event.body)) return send("❌ Lựa chọn không hợp lệ!", tid, mid);
    if (event.body == "1") {
      unsend(handleReply.messageID);
      return send("Chọn chế độ:\n1. Dễ (10 mìn)\n2. Trung bình (15 mìn)\n3. Khó (20 mìn)", tid, (error, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: sid,
          type: "newgame"
        })
      }, mid)
    }
    if (event.body == "2") return send(texthelp, tid, mid);
    if (event.body == "3") {
      try {
      unsend(handleReply.messageID);
      await loadAvt(sid);
      var map = JSON.parse(fs.readFileSync(dirpath+sid+".json"));
      return send({body:"1. Đào lên\n2. Đánh dấu\n3. Bỏ đánh dấu\nVd: 1 E5 (đào ô E5)", attachment: fs.createReadStream(await draw(map, sid))}, tid, (error, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: sid,
          type: "play"
        })
      }, mid);
	  } catch (error) {console.log(error) ; return send(`❌ Đã xảy ra lỗi!\n Vui lòng thử lại hoặc chơi mới\n Chi tiết lỗi:\n${error}`,tid,mid)}
    }
  }
  if (handleReply.type == "play") {
    var map = JSON.parse(fs.readFileSync(dirpath+sid+".json"));
    var choose = parseInt(args[0]);
    if (![1,2,3].includes(choose)) return send("❌ Cú pháp không hợp lệ!",tid,mid);
    var string = "ABCDEFGHIK";
	async function openAll(board) {
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 7; j++) {
          if (!board[i][j].opened) board[i][j].opened = true;
          if (board[i][j].markked) board[i][j].markked = false;
        }
      }
      return board;
    }
    if (choose == 1) { // đào lên
      if (args.length == 1) return send("❌ Vui lòng nhập các tọa độ cần đào!",tid,mid);
      unsend(handleReply.messageID);
      var success = [];
      for (let i = 1; i < args.length; i++ ) {
        var x = string.indexOf(args[i].slice(0,1).toUpperCase());
        if (x == -1) continue;
        var y = parseInt(args[i].slice(1,2));
        if (isNaN(y) || y<0 || y>6) continue;
        if (map[x][y].opened) continue;
        if (map[x][y].markked) continue;
        success.push(""+x+y);
        map[x][y].opened = true;
        map[0][0].complete += 1;
        if (map[x][y].isMine) {
          return send({body:"Trò chơi kết thúc!\nBạn đã đào trúng mìn 💣", attachment: fs.createReadStream(await draw(map, sid))}, tid, ()=> delData(sid), mid);
        }
      }
      if (map[0][0].complete == 70-map[0][0].mode) {
        map = await openAll(map);
          return send({body:"🏆 Bạn đã thắng!", attachment: fs.createReadStream(await draw(map, sid))}, tid, ()=> delData(sid), mid);
      }
      fs.writeFileSync(dirpath+`${sid}.json`, JSON.stringify(map, null, 2));
      return send({body:"Đào thành công: " + success.length + " ô\n1. Đào lên\n2. Đánh dấu\n3. Bỏ đánh dấu\nVd: 1 E5 (đào ô E5)", attachment: fs.createReadStream(await draw(map, sid))}, tid, (error, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: sid,
          type: "play"
        })
      }, mid);
    }
    if (choose == 2) { //dánh dấu
      if (args.length == 1) return send("❌ Vui lòng nhập các tọa độ cần đánh dấu!",tid,mid);
      unsend(handleReply.messageID);
      var success = [];
      for (let i = 1; i < args.length; i++ ) {
        var x = string.indexOf(args[i].slice(0,1).toUpperCase());
        if (x == -1) continue;
        var y = parseInt(args[i].slice(1,2));
        if (isNaN(y) || y<0 || y>6) continue;
        if (map[x][y].markked) continue;
        if (map[x][y].opened) continue;
        map[x][y].markked = true;
        map[0][0].flag += 1; success.push("" +x+y)
      }
      if (map[0][0].flag == map[0][0].mode) {
        var correct = 0;
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 7; j++) {
            if (map[i][j].markked && map[i][j].isMine) correct++;
          }
        }
        if (correct == map[0][0].mode) {
          map = await openAll(map);
          return send({body:"🏆 Bạn đã thắng!", attachment: fs.createReadStream(await draw(map, sid))}, tid, ()=> delData(sid), mid);
        }
	  }
      fs.writeFileSync(dirpath+`${sid}.json`, JSON.stringify(map, null, 2));
      return send({body:"Đánh dấu thành công: " + success.length + " ô\n1. Đào lên\n2. Đánh dấu\n3. Bỏ đánh dấu\nVd: 1 E5 (đào ô E5)", attachment: fs.createReadStream(await draw(map, sid))}, tid, (error, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: sid,
          type: "play"
        })
      }, mid);
    }
    if (choose == 3) { // bỏ đánh dấu
      if (args.length == 1) return send("❌ Vui lòng nhập các tọa độ cần đánh dấu!",tid,mid);
      unsend(handleReply.messageID);
      var success = [];
      for (let i = 1; i < args.length; i++ ) {
        var x = string.indexOf(args[i].slice(0,1).toUpperCase());
        if (x == -1) continue;
        var y = parseInt(args[i].slice(1,2));
        if (isNaN(y) || y<0 || y>6) continue;
        if (!map[x][y].markked) continue;
        map[x][y].markked = false;
        map[0][0].flag--; success.push(""+x+y);
      }
      if (map[0][0].flag == map[0][0].mode) {
        var correct = 0;
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 7; j++) {
            if (map[i][j].markked && map[i][j].isMine) correct++;
          }
        }
        if (correct == map[0][0].mode) {
          map = await openAll(map);
          return send({body:"🏆 Bạn đã thắng!", attachment: fs.createReadStream(await draw(map, sid))}, tid, ()=> delData(sid), mid);
        }
	  }
      fs.writeFileSync(dirpath+`${sid}.json`, JSON.stringify(map, null, 2));
      return send({body:"Bỏ đánh dấu thành công: " + success.length + " ô\n1. Đào lên\n2. Đánh dấu\n3. Bỏ đánh dấu\nVd: 1 E5 (đào ô E5)", attachment: fs.createReadStream(await draw(map, sid))}, tid, (error, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: sid,
          type: "play"
        })
      }, mid);
    }
  }
 } catch(error) {console.log(error); return send("Đã xảy ra lỗi!"+error, tid, mid)}
}
