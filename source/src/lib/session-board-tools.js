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
  { id: "angry", label: "כועס", labelEn: "Angry", asset: "/icon-bank/emotions/angry.webp" },
  { id: "tired", label: "עייף", labelEn: "Tired", asset: "/icon-bank/emotions/tired.webp" },
];
export const findEmotion = (id) => EMOTIONS.find((emotion) => emotion.id === id) || null;

// Toys and materials from the therapy room (ids stay the same so saved boards keep their names).
const TOYS = "/icon-bank/toys";
export const BOARD_GAMES = [
  { id: "doll", label: "בובה", labelEn: "Doll", asset: `${TOYS}/doll.webp` },
  { id: "play-kitchen", label: "מטבח ילדים", labelEn: "Play kitchen", asset: `${TOYS}/play-kitchen.webp` },
  { id: "chef-hat", label: "בישול", labelEn: "Cooking", asset: `${TOYS}/chef-hat.webp` },
  { id: "cars", label: "מכוניות", labelEn: "Cars", asset: `${TOYS}/cars.webp` },
  { id: "lego", label: "לגו", labelEn: "Lego", asset: `${TOYS}/lego.webp` },
  { id: "magnetic-tiles", label: "מגנטים לבנייה", labelEn: "Magnetic tiles", asset: `${TOYS}/magnetic-tiles.webp` },
  { id: "puzzle", label: "פאזל", labelEn: "Puzzle", asset: `${TOYS}/puzzle.webp` },
  { id: "board-game", label: "משחק קופסה", labelEn: "Board game", asset: "/icon-bank/social-new/seed-35-turn-draw/material-board-game.webp" },
  { id: "cards", label: "קלפים", labelEn: "Cards", asset: `${TOYS}/cards.webp` },
  { id: "bubbles", label: "בועות סבון", labelEn: "Bubbles", asset: `${TOYS}/bubbles.webp` },
  { id: "ball", label: "כדור", labelEn: "Ball", asset: "/icon-bank/movement-new/seed-90-illustrated/material-soft-ball.webp" },
  { id: "paper-pencil", label: "דף ועיפרון", labelEn: "Paper and pencil", asset: "/icon-bank/embedded-v359/seed-71/material-pencil.webp" },
  { id: "markers", label: "טושים", labelEn: "Markers", asset: "/icon-bank/crafts-new/seed-100-independent/material-colored-markers.webp" },
  { id: "crayons", label: "צבעי שעווה", labelEn: "Crayons", asset: "/icon-bank/embedded-v359/seed-71/material-crayons.webp" },
  { id: "scissors", label: "מספריים", labelEn: "Scissors", asset: "/icon-bank/crafts-new/shared-independent/scissors.webp" },
  { id: "stickers", label: "מדבקות", labelEn: "Stickers", asset: "/icon-bank/crafts-new/seed-33-independent/material-stickers.webp" },
  { id: "play-dough", label: "בצק", labelEn: "Play dough", asset: "/icon-bank/crafts-new/seed-63-independent/material-plasticine.webp" },
  { id: "therapy-putty", label: "פלסטלינה טיפולית", labelEn: "Therapy putty", asset: `${TOYS}/therapy-putty.webp` },
  { id: "kinetic-sand", label: "חול קינטי", labelEn: "Kinetic sand", asset: "/assets/therapist-games/kinetic-sand.png" },
  { id: "beads", label: "חרוזים ושרוך", labelEn: "Beads and lace", asset: `${TOYS}/beads.webp` },
  { id: "tweezers", label: "פינצטה", labelEn: "Tweezers", asset: "/icon-bank/fine-motor-new/seed-37-tweezers-pompoms/material-tweezers.webp" },
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
