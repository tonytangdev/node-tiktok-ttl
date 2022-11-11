// @ts-check

import fs from "fs";
import fetch from "node-fetch";

const API_URL = "https://tiktok-tts.weilnet.workers.dev/api/generation";

const AVAILABLE_VOICES = [
  // English US
  "en_us_001", // Female
  "en_us_006", // Male 1
  "en_us_007", // Male 2
  "en_us_009", // Male 3
  "en_us_010", // Male 4

  // English UK
  "en_uk_001", // Male 1
  "en_uk_003", // Male 2

  // English AU
  "en_au_001", // Female
  "en_au_002", // Male

  // French
  "fr_001", // Male 1
  "fr_002", // Male 2

  // German
  "de_001", // Female
  "de_002", // Male

  // Spanish
  "es_002", // Male

  // Spanish MX
  "es_mx_002", // Male

  // Portuguese BR
  "br_003", // Female 2
  "br_004", // Female 3
  "br_005", // Male

  // Indonesian
  "id_001", // Female

  // Japanese
  "jp_001", // Female 1
  "jp_003", // Female 2
  "jp_005", // Female 3
  "jp_006", // Male

  // Korean
  "kr_002", // Male 1
  "kr_002", // Male 2
  "kr_002", // Female
];

/**
 * Call the API and returns the mp3 data as string
 * @param {string} text text to be read
 * @param {string} voice voice to be used
 * @returns mp3 data as string
 */
async function callAPI(text, voice) {
  const body = JSON.stringify({
    text,
    voice,
  });

  const headers = {
    "content-type": "application/json",
  };

  const req = await fetch(API_URL, {
    method: "POST",
    body,
    headers,
  });

  if (req.status !== 200) {
    const error = { status: req.status, statusText: req.statusText };
    throw error;
  }

  const json = await req.json();
  // @ts-ignore
  const mp3 = json.data;

  return mp3;
}

/**
 *
 * @param {string} mp3 mp3 data
 * @param {number} index path to file
 */
function writeMP3File(mp3, index) {
  if (!fs.existsSync("audios")) {
    fs.mkdirSync("audios");
  }
  fs.writeFileSync(`audios/audio-${index}.mp3`, mp3, {
    encoding: "base64",
  });
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main() {
  const voice = process.argv[2];
  if (!voice || !AVAILABLE_VOICES.includes(voice))
    throw "A valid voice must be passed. Look at AVAILABLE_VOICES to set the desired voice.";

  const text = process.argv[3];
  if (!text) throw "A text must be passed as the second argument.";

  const textAsArr = text.split(" ");

  const texts = [];
  let j = 0;
  let currentSentence = "";
  for (let index = 0; index < textAsArr.length; index++) {
    const word = textAsArr[index];
    const newSentence = `${currentSentence} ${word}`;

    if (newSentence.length > 250 || index === textAsArr.length - 1) {
      texts[j] = `${newSentence}`;
      currentSentence = "";
      j++;
    } else {
      currentSentence += ` ${word}`;
    }
  }

  let mp3s = "";
  for (let index = 0; index < texts.length; index++) {
    if (index !== 0) {
      await sleep(5);
    }
    const text = texts[index];
    const mp3 = await callAPI(text, voice);

    mp3s += mp3;
    writeMP3File(mp3s, index);
  }
}

(async () => {
  await main();
})();
