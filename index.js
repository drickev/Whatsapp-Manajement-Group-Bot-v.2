const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const fs = require("fs");

// Handlers
const welcomeHandler = require("./handlers/welcome/welcome");
const linkFilter = require("./handlers/linkfilter/linkfilter");
const { handleTimeoutCommand, handleReleaseCommand, checkAndBlockTimedOutUser } = require("./handlers/timeout/timeouthandler");
const { assignToRole, handleTagRole } = require("./handlers/roles/rolehandler");
//const tagall = require("./handlers/tagall/tagall")
//const autoResponder = require('./handlers/autoResponder/autoResponder')

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  const sock = makeWASocket({ auth: state });
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, qr }) => {
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === "close") startBot();
  });

  sock.ev.on("group-participants.update", update => welcomeHandler(sock, update));

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    await checkAndBlockTimedOutUser(sock, msg);
    //await tagall(sock, msg);
    await linkFilter(sock, msg);
    await handleTimeoutCommand(sock, msg);
    await handleReleaseCommand(sock, msg);
    await assignToRole(sock, msg);
    await handleTagRole(sock, msg);
    //await autoResponder(sock, msg);
    
  });
}

startBot();
setInterval(() => {}, 1000*60*60);
