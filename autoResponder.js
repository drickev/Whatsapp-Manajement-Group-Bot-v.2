// responder.js

const triggerWords = [
    // Versi awal milikmu
    "kntl", "kontol", "kntol", "kontl", "komtol", "puqi", "puki",
    "slot", "gacor", "memek", "mmk", "mmek", "babi", "pepek", "ppk", "ppek",
    "gay", "jomok", "ngntd", "ngntod", "ngentd", "ngentod", "ngewe",
    "ewe", "ngew", "ngw", "ewee", "eewe", "eewee", "bokep", "bokp", "bkep", "bkp",
    "squirt", "cum", "ambatukam", "tytyd", "titid", "jav", "hentai", "cabul", "bool",
    "bab1", "b4bi", "b4b1", "pekob", "kont", "ngento", "ngentoy", "cukimay", "cuki",

    // Tambahan Bahasa Indonesia & gaul
    "sange", "sangean", "colmek", "masturbasi", "ngocok", "colie", "coli",
    "ngentot", "jilmek", "hisap", "titit", "totong", "crot", "kocokan", "dientot",
    "ngulum", "titid", "zakar", "peler", "ewean", "pelacur", "lonte", "germo", "sundal",
    "bencong", "banci", "transpuan", "klaminan", "jembut", "buluk", "vulva", "kelamin",

    // Bahasa Inggris (vulgar/slang)
    "fuck", "fucked", "fucker", "fucking", "shit", "dick", "dildo", "pussy",
    "boobs", "tits", "tit", "cumshot", "asshole", "bitch", "whore", "slut", "horny",
    "jerkoff", "masturbate", "suck", "cock", "blowjob", "handjob", "69ing", "licking",
    "penetration", "anal", "vagina", "penis", "erotic", "porno", "pornhub", "milf",

    // Bahasa daerah / campuran populer
    "maksiat", "syahwat", "ngaceng", "mesum", "syur", "basah", "kenthu", "tusu", "diemong",
    "nyepong", "berahi", "birahi", "kocok", "sarap", "bercinta", "pelukan", "cumbuan", "ngangkang"
];

const extraVariations = [
    "anjng", "anjjj", "kontl", "komtol", "toool", "gblak", "slt", "mpek",
    "b3bi", "pukii", "pukiii"
];

const allTriggerWords = [...triggerWords, ...extraVariations];

const whitelistNumbers = [
    "6285249974145@s.whatsapp.net",
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
    "mengayomi", "pengayoman", "gayeng", "mengumpulkan"
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
