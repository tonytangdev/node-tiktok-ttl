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
  fs.writeFileSync(`audio-${index}.mp3`, mp3, {
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

  const text = `
  So I had to stop at the Home Depot on the way home tonight to get pellets. I grabbed like 10 bags/500 lbs of pellets. So i park my cart and i go get my truck. I park my truck in the left side of a 2 car wide loading zone. If you’ve been to Home Depot you’re probably familiar.

Now here’s the situation . There’s a dude and an employee loading up drywall in a truck. This guy has his cart in the left land and his door opened into the left lane. I finished loading first so i shouted, “hey can you move your stuff real quick so i can get through. Now this is where it gets weird. The customer looks up but I’m not sure if the employee heard me. The customer either didn’t hear me or ignored me, i don’t know. So I slowly pull up and start squeezing through. Guy asks what I’m doing. I let him him know I’m trying to go home and he’s blocking the exit. At this point he hasn’t moved his cart or shut his door. I’m not sure what’s going on at this point. Dude has started some weird stand off rather than just shut his door and squeeze his car up. At this point I’m actually getting annoyed and i feel like he’s taunting me. So i ask him why he’s being an asshole and not just moving. So he pulls out his phone cam. So now that he’s been refused to clear the lane and allow me to exit he starts recording me now that I’m annoyed. I let him know that he can record me and that’s fine but he’s still in my way and I’m still calling him an asshole for not moving to begin with. After a minute or so of this he finally squeezes up so i can leave.

I mean dude had a full cart of purchases to load in his truck. Did he expect me to just sit there and wait for him to load his entire cart? Is that a reasonable position?

Now I’ll admit I’ve had a day and my commute is long, prolly longer than yours or his.

I got heated and cursed at the dude but i also feel like I was being taunted. Like he egged me on till i was upset then pulled his camera out.

Am i the asshole here.
  `;
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
