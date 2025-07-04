// responder.js

const triggerWords = [
    // Versi awal milikmu
  "add_your_forbidde_word"
];

const extraVariations = [
    "add_your_forbidde_word"
];

const allTriggerWords = [...triggerWords, ...extraVariations];

const whitelistNumbers = [
    "62xxxxxx@s.whatsapp.net", // whitelist
];

// Versi baru fungsi buildFlexibleRegex
function buildFlexibleRegex(word) {
    const pattern = word
        .split('')
        .map(char => `${char}[^a-zA-Z0-9]{0,1}?`) // hanya toleransi 0–1 karakter non-alfabet antar huruf
        .join('');
    return new RegExp(`\\b${pattern}\\b`, "i"); // word boundary = hanya cocok jika kata utuh
}

function buildFlexibleRegex(word) {
    const pattern = word
        .split('')
        .map(char => `[${char}][^a-zA-Z0-9]{0,3}`)
        .join('');
    return new RegExp(`${pattern}([a-z]{0,5})?`, "i");
}

function reverseWord(word) {
    return word.split('').reverse().join('');
}

const safeWords = [
    "exception"
];

// ✅ Fungsi utama
module.exports = async function autoResponder(sock, msg) {
    const conversationText =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.pollCreationMessage?.name || "";

    const pollOptions =
        msg.message?.pollCreationMessage?.options?.map(opt => opt.optionName).join(" ") || "";

    const fullRawText = conversationText + " " + pollOptions;
    const normalizedText = normalizeText(fullRawText);

    const sender = msg.key.participant || msg.key.remoteJid;

    // ✅ Lewati jika pengirim adalah whitelisted
    if (whitelistNumbers.includes(sender)) return;

    const isSafe = safeWords.some(sw => normalizedText.includes(sw));
    if (isSafe) return;

    const isTriggered = allTriggerWords.some(word => {
        const regexNormal = buildFlexibleRegex(word);
        const regexReversed = buildFlexibleRegex(reverseWord(word));
        return regexNormal.test(normalizedText) || regexReversed.test(normalizedText);
    });

    if (isTriggered) {
        try {
            await sock.sendMessage(msg.key.remoteJid, {
                delete: msg.key
            });
        } catch (err) {
            console.error("Gagal menghapus pesan:", err);
        }

        await sock.sendMessage(msg.key.remoteJid, {
            text: "*Aduh kamu jangan cabul!*"
        });
    }
};
