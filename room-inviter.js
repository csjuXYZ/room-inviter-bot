const { Wechaty, ScanStatus, log } = require("wechaty");
const { RoomInviter,Heartbeat } = require("wechaty-plugin-contrib");

const 群聊名称特征词 = "面即";
const 邀请关键词="进群"
const roomInviterConfig = {
  password: 邀请关键词,
  room: new RegExp(群聊名称特征词),
  rule: "Please be a good people",//发出群聊邀请之前的规则申明
  welcome: "Welcome to join the room!",//进入群聊后的欢迎词
  repeat: "You have already in our room",//你已经加入了群聊
};
Wechaty.use(RoomInviter(roomInviterConfig));

const heartbeatConfig = {
  contact: 'filehelper',    // default: filehelper - Contact id who will receive the emoji
  emoji: {
    heartbeat: '[爱心]',    // default: [爱心] - Heartbeat emoji
  },
  intervalSeconds: 1 * 60, // Default: 1 hour - Send emoji for every 1 hour
}
Wechaty.use(Heartbeat(heartbeatConfig))

function onScan(qrcode, status) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    require("qrcode-terminal").generate(qrcode, { small: true }); // show qrcode on console

    const qrcodeImageUrl = [
      "https://wechaty.js.org/qrcode/",
      encodeURIComponent(qrcode),
    ].join("");

    log.info(
      "StarterBot",
      "onScan: %s(%s) - %s",
      ScanStatus[status],
      status,
      qrcodeImageUrl
    );
  } else {
    log.info("StarterBot", "onScan: %s(%s)", ScanStatus[status], status);
  }
}

function onLogin(user) {
  log.info("StarterBot", "%s login", user);
}

function onLogout(user) {
  log.info("StarterBot", "%s logout", user);
}

async function onMessage(msg) {
  if (msg.self()) return;
  // log.info("StarterBot", msg.toString());
  // if (msg.room()) log.info("room", msg.room().id);
  if (msg.text() === "列出群") {
    let list = await bot.Room.findAll({ topic: /面即/ });
    let topicList = await Promise.all(list.map((room) => room.topic()));
    log.info("room", topicList);
    await msg.say(topicList.toString());
  }
}

const bot = new Wechaty({
  name: "room-inviter-bot",
});

bot.on("scan", onScan);
bot.on("login", onLogin);
bot.on("logout", onLogout);
bot.on("message", onMessage);

bot
  .start()
  .then(() => log.info("StarterBot", "Starter Bot Started."))
  .catch((e) => log.error("StarterBot", e));
