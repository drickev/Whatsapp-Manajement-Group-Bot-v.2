const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../../data/roles.json");
const cooldownPath = path.join(__dirname, "../../data/cooldown.json");
const COOLDOWN_DURATION = 1200 * 1000; // durasi cooldown dalam ms (contoh: 60 detik)

function loadRoles() {
  return JSON.parse(fs.readFileSync(dataPath, "utf-8"));
}

function saveRoles(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function loadCooldown() {
  if (!fs.existsSync(cooldownPath)) return {};
  return JSON.parse(fs.readFileSync(cooldownPath, "utf-8"));
}

function saveCooldown(data) {
  fs.writeFileSync(cooldownPath, JSON.stringify(data, null, 2));
}

module.exports = {
  assignToRole: async (sock, msg) => {
    const message = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    const sender = msg.key.participant || msg.key.remoteJid;
    const from = msg.key.remoteJid;

    if (!message || !from.endsWith("@g.us")) return;

    const lower = message.toLowerCase();

    // ADD ROLE
    if (lower.startsWith("addrole")) {
      const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      const role = lower.includes("wf") ? "wf" : lower.includes("ops") ? "ops" : null;
      if (!role) return;

      const targetIds = mentions.length > 0 ? mentions : [sender];
      const roles = loadRoles();

      for (const id of targetIds) {
        if (!roles[role].includes(id)) {
          roles[role].push(id);
        }
      }

      saveRoles(roles);

      await sock.sendMessage(from, {
        text: `✅ Berhasil menambahkan ${targetIds.length > 1 ? "beberapa member" : "member"} ke role *${role}*.`,
        mentions: targetIds
      });
      return;
    }

    // REMOVE ROLE
    if (lower.startsWith("removerole")) {
      const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      const role = lower.includes("wf") ? "wf" : lower.includes("ops") ? "ops" : null;
      if (!role) return;

      const targetIds = mentions.length > 0 ? mentions : [sender];
      const roles = loadRoles();

      let removed = [];

      for (const id of targetIds) {
        const index = roles[role].indexOf(id);
        if (index !== -1) {
          roles[role].splice(index, 1);
          removed.push(id);
        }
      }

      saveRoles(roles);

      if (removed.length > 0) {
        await sock.sendMessage(from, {
          text: `✅ Berhasil menghapus ${removed.length > 1 ? "beberapa member" : "member"} dari role *${role}*.`,
          mentions: removed
        });
      } else {
        await sock.sendMessage(from, {
          text: `⚠️ kamu tidak masuk dalam role *${role}*.`
        });
      }
      return;
    }

    // COUNT ROLE
    if (lower.startsWith("rolecount")) {
      const role = lower.includes("wf") ? "wf" : lower.includes("ops") ? "ops" : null;
      if (!role) return;

      const roles = loadRoles();
      const count = roles[role]?.length || 0;

      await sock.sendMessage(from, {
        text: `📊 Jumlah member di role *${role}*: *${count}* orang.`
      });
      return;
    }
  },

  handleTagRole: async (sock, msg) => {
    const message = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!message || !from.endsWith("@g.us")) return;

    const lower = message.toLowerCase();
    const role = lower.includes("mabar wf") ? "wf" : lower.includes("mabar ops") ? "ops" : null;
    if (!role) return;

    const cooldown = loadCooldown();
    const now = Date.now();

    if (cooldown[sender] && cooldown[sender] > now) {
      const senderMention = `@${sender.split("@")[0]}`;
      await sock.sendMessage(from, {
        text: `⏳ Saat ini kamu sedang cooldown menggunakan perintah ${senderMention}`,
        mentions: [sender]
      });
      return;
    }

    cooldown[sender] = now + COOLDOWN_DURATION;
    saveCooldown(cooldown);

    setTimeout(() => {
      const latest = loadCooldown();
      delete latest[sender];
      saveCooldown(latest);
    }, COOLDOWN_DURATION);

    const roles = loadRoles();
    const members = roles[role];

    if (members.length === 0) {
      await sock.sendMessage(from, { text: `⚠️ Belum ada member di role *${role}*.` });
      return;
    }

    const mentions = [...members, sender];
    const senderMention = `@${sender.split("@")[0]}`;

    await sock.sendMessage(from, {
      text: `mabar *${role}* bareng ${senderMention}`,
      mentions
    });
  }
};
