// Items the therapist can drop onto the session board: agreed visual signs and games.
// Saved board items keep the same shape as on the live site, so existing boards still open.

export const VISUAL_SIGNS = [
  { id: "enough", label: "מספיק", labelEn: "Enough", asset: "/icon-bank/ui/visual-signs-v95/enough.png" },
  { id: "more", label: "עוד", labelEn: "More", asset: "/icon-bank/ui/visual-signs-v95/more.png" },
  { id: "stop", label: "עצור", labelEn: "Stop", asset: "/icon-bank/ui/visual-signs-v95/stop.png" },
  { id: "my-turn", label: "תורי", labelEn: "My turn", asset: "/icon-bank/ui/visual-signs-v95/my-turn.png" },
  { id: "your-turn", label: "תורך", labelEn: "Your turn", asset: "/icon-bank/ui/visual-signs-v95/your-turn.png" },
];

// Emotion faces (the same boy, a shirt colour for each feeling), added to the board as pictures.
export const EMOTIONS = [
  { id: "happy", label: "שמח", labelEn: "Happy", asset: "/icon-bank/emotions/happy.webp" },
  { id: "calm", label: "רגוע", labelEn: "Calm", asset: "/icon-bank/emotions/calm.webp" },
  { id: "excited", label: "נרגש", labelEn: "Excited", asset: "/icon-bank/emotions/excited.webp" },
  { id: "sad", label: "עצוב", labelEn: "Sad", asset: "/icon-bank/emotions/sad.webp" },
  { id: "worried", label: "דואג", labelEn: "Worried", asset: "/icon-bank/emotions/worried.webp" },
  { id: "scared", label: "מפחד", labelEn: "Scared", asset: "/icon-bank/emotions/scared.webp" },
  { id: "tired", label: "עייף", labelEn: "Tired", asset: "/icon-bank/emotions/tired.webp" },
];
export const findEmotion = (id) => EMOTIONS.find((emotion) => emotion.id === id) || null;

export const BOARD_GAMES = [
  { id: "play-kitchen", label: "מטבח ילדים", labelEn: "Play kitchen", asset: "/assets/therapist-games/play-kitchen.png" },
  { id: "paper-pencil", label: "דף ועיפרון", labelEn: "Paper and pencil", asset: "/assets/therapist-games/paper-pencil.png" },
  { id: "board-game", label: "משחק קופסה", labelEn: "Board game", asset: "/assets/therapist-games/board-game.png" },
  { id: "doll", label: "בובה", labelEn: "Doll", asset: "/assets/therapist-games/doll.png" },
  { id: "kinetic-sand", label: "חול קינטי", labelEn: "Kinetic sand", asset: "/assets/therapist-games/kinetic-sand.png" },
  { id: "play-dough", label: "בצק", labelEn: "Play dough", asset: "/assets/therapist-games/play-dough.png" },
  { id: "markers", label: "טושים", labelEn: "Markers", asset: "/assets/therapist-games/markers.png" },
  { id: "chef-hat", label: "כובע שף", labelEn: "Chef hat", asset: "/assets/therapist-games/chef-hat.png" },
];

export const localizedLabel = (entry, language) => (language === "en" ? entry.labelEn : entry.label);
export const findSign = (id) => VISUAL_SIGNS.find((sign) => sign.id === id) || null;
export const findBoardGame = (id) => BOARD_GAMES.find((game) => game.id === id) || null;

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

// A sign is stored on the board as a 600×600 PNG card: picture plus the word in the board language.
const cardCache = new Map();
export function renderSignCard(sign, language) {
  const cacheKey = `${language === "en" ? "en" : "he"}:${sign.id}`;
  if (cardCache.has(cacheKey)) return cardCache.get(cacheKey);
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = async () => {
      try { if (document.fonts?.load) await document.fonts.load("800 64px Rubik"); } catch { /* fallback font */ }
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 600;
      const context = canvas.getContext("2d");
      context.fillStyle = "#fff";
      roundRect(context, 12, 12, 576, 576, 52);
      context.fill();
      context.lineWidth = 12;
      context.strokeStyle = "#111";
      context.stroke();
      context.drawImage(image, 82, 42, 436, 436);
      context.direction = language === "en" ? "ltr" : "rtl";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "#111";
      context.font = "800 64px Rubik, Arial, sans-serif";
      context.fillText(localizedLabel(sign, language), 300, 530);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = reject;
    image.src = sign.asset;
  });
  cardCache.set(cacheKey, promise);
  promise.catch(() => cardCache.delete(cacheKey));
  return promise;
}

// Resize a photo from the camera or gallery to a JPEG data URL.
export function readPhotoFile(file, maxSize, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.onerror = reject;
      image.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
