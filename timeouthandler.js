const whitelist = [
  "6285249974145@s.whatsapp.net" // Ganti dengan nomor admin
];

const timeoutList = new Map(); // Map<group:user, timestamp>

module.exports = {
  handleTimeoutCommand: async (sock, msg) => {
    const message = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    const sender = msg.key.participant || msg.key.remoteJid;
    const from = msg.key.remoteJid;

    if (!message || !from.endsWith("@g.us") || !whitelist.includes(sender)) return;

    const lower = message.toLowerCase();
    if (!lower.startsWith("timeout")) return;

    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    // Ambil durasi dari akhir pesan dengan asumsi format: "timeout @user 5"
    const parts = message.trim().split(/\s+/);
    const duration = parseInt(parts[parts.length - 1]);

    if (!mentions.length || isNaN(duration)) return;

    for (const target of mentions) {
      const key = `${from}:${target}`;
      const until = Date.now() + duration * 60 * 1000;
      timeoutList.set(key, until);

      await sock.sendMessage(from, {
        text: `⏳ @${target.split("@")[0]} diberi timeout selama ${duration} menit.`,
        mentions: [target]
      });
    }
  },

  handleReleaseCommand: async (sock, msg) => {
    const message = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    const sender = msg.key.participant || msg.key.remoteJid;
    const from = msg.key.remoteJid;

    if (!message || !from.endsWith("@g.us") || !whitelist.includes(sender)) return;

    if (!message.toLowerCase().startsWith("release")) return;

    for (const key of timeoutList.keys()) {
      if (key.startsWith(from)) timeoutList.delete(key);
    }

    await sock.sendMessage(from, { text: `✅ Semua user yang di-timeout telah direlease dari grup ini.` });
  },

  checkAndBlockTimedOutUser: async (sock, msg) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const key = `${from}:${sender}`;

    if (timeoutList.has(key)) {
      const expires = timeoutList.get(key);
      const now = Date.now();

      if (now < expires) {
        await sock.sendMessage(from, { delete: msg.key });
      } else {
        timeoutList.delete(key); // Hapus jika sudah expired
      }
    }
  }
};
