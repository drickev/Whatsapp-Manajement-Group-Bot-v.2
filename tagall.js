const whitelist = [
  "6285249974145@s.whatsapp.net",
  "6287784164410@s.whatsapp.net",
  "6281381836418@s.whatsapp.net",
  "6283872988278@s.whatsapp.net",
  "6285156481256@s.whatsapp.net",
  "628985773442@s.whatsapp.net",
  "6283163054071@s.whatsapp.net"
];

module.exports = async function tagAllHandler(sock, msg) {
  const message = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
  const sender = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;

  // Hanya grup dan dari whitelist
  if (!message || !from.endsWith("@g.us") || !whitelist.includes(sender)) return;

  // Jika mengandung kata "tag"
  if (message.toLowerCase().includes("tag all")) {
    try {
      const groupMetadata = await sock.groupMetadata(from);
      const mentions = groupMetadata.participants.map(p => p.id);

      await sock.sendMessage(from, {
        text: "📢 *PENTING*", // Pesan singkat tanpa menampilkan semua nomor
        mentions
      });
    } catch (err) {
      console.error("❌ Gagal mengirim tag all:", err);
    }
  }
};
