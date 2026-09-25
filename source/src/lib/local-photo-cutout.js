// הסרת רקע מתמונת הילד — מתבצעת כולה בדפדפן. התמונה לא נשלחת לשרת.
// המודל (RMBG-1.4) נטען מ-jsDelivr בפעם הראשונה ונשמר במטמון הדפדפן.

const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1";
const MODEL_ID = "briaai/RMBG-1.4";

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const isFile = typeof source !== "string";
    const url = isFile ? URL.createObjectURL(source) : source;
    const image = new Image();
    image.onload = () => {
      if (isFile) URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      if (isFile) URL.revokeObjectURL(url);
      reject(new Error("IMAGE_LOAD_FAILED"));
    };
    image.src = url;
  });
}

// מקטין את התמונה שהועלתה ל-1200 פיקסלים לכל היותר ומחזיר JPEG.
export async function prepareUploadedPhoto(file) {
  const image = await loadImage(file);
  const ratio = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.9);
}

// חותך את השוליים השקופים סביב הדמות ומשאיר ריבוע בערך סביב הראש והכתפיים.
function cropToSubject(canvas) {
  const { data } = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
  let left = canvas.width, top = canvas.height, right = -1, bottom = -1;
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      if (data[(y * canvas.width + x) * 4 + 3] > 18) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
  }
  if (right < left || bottom < top) return canvas.toDataURL("image/png");
  const subjectWidth = right - left + 1;
  const subjectHeight = bottom - top + 1;
  const side = Math.min(canvas.width, canvas.height, Math.max(subjectWidth, Math.min(subjectHeight, subjectWidth * 1.12)));
  const centerX = (left + right) / 2;
  left = Math.max(0, Math.round(centerX - side / 2));
  right = Math.min(canvas.width - 1, Math.round(left + side - 1));
  left = Math.max(0, right - Math.round(side) + 1);
  top = Math.max(0, top - Math.round(side * 0.04));
  bottom = Math.min(canvas.height - 1, top + Math.round(side) - 1);
  const output = document.createElement("canvas");
  output.width = right - left + 1;
  output.height = bottom - top + 1;
  output.getContext("2d").drawImage(canvas, left, top, output.width, output.height, 0, 0, output.width, output.height);
  return output.toDataURL("image/png");
}

// חלון התקדמות פשוט שמוצג בזמן הורדת המודל והעיבוד.
let overlay = null;
function showProgress(text, percent) {
  if (typeof document === "undefined") return;
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45);backdrop-filter:blur(2px)";
    const box = document.createElement("div");
    box.style.cssText = "background:#fff;border-radius:16px;padding:20px 28px;width:min(320px,85vw);box-shadow:0 10px 40px rgba(0,0,0,.25);text-align:center;direction:rtl";
    box.innerHTML = '<div data-progress-text style="font-weight:700;margin-bottom:12px;font-size:15px"></div><div style="height:10px;background:#eee;border-radius:99px;overflow:hidden"><div data-progress-bar style="height:100%;width:0%;background:#4a7c59;border-radius:99px;transition:width .2s"></div></div><div data-progress-percent style="margin-top:8px;font-size:13px;color:#666"></div>';
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }
  overlay.querySelector("[data-progress-text]").textContent = text;
  const bar = overlay.querySelector("[data-progress-bar]");
  const label = overlay.querySelector("[data-progress-percent]");
  if (percent == null) {
    bar.style.width = "40%";
    label.textContent = "";
  } else {
    bar.style.width = `${Math.round(percent)}%`;
    label.textContent = `${Math.round(percent)}%`;
  }
}
function hideProgress() {
  overlay?.remove();
  overlay = null;
}
function onModelProgress(event) {
  if (!event) return;
  if (event.status === "progress" && event.file && (event.file.endsWith(".onnx_data") || event.file.endsWith(".onnx"))) {
    showProgress("מוריד את מנוע הסרת הרקע...", event.progress);
  } else if (event.status === "ready") {
    showProgress("מכין את המנוע...", null);
  }
}

let modelPromise = null;
function loadModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      const transformers = await import(/* @vite-ignore */ TRANSFORMERS_URL);
      transformers.env.allowLocalModels = false;
      const model = await transformers.AutoModel.from_pretrained(MODEL_ID, {
        config: { model_type: "custom" },
        progress_callback: onModelProgress,
      });
      const processor = await transformers.AutoProcessor.from_pretrained(MODEL_ID, {
        config: {
          do_normalize: true,
          do_pad: false,
          do_rescale: true,
          do_resize: true,
          image_mean: [0.5, 0.5, 0.5],
          feature_extractor_type: "ImageFeatureExtractor",
          image_std: [1, 1, 1],
          resample: 2,
          rescale_factor: 0.00392156862745098,
          size: { width: 1024, height: 1024 },
        },
      });
      return { transformers, model, processor };
    })().catch((error) => {
      modelPromise = null;
      throw error;
    });
  }
  return modelPromise;
}

async function cutOut(source) {
  const image = await loadImage(source);
  const ratio = Math.min(1, 1024 / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, width, height);

  const { transformers, model, processor } = await loadModel();
  showProgress("מסיר את הרקע...", null);
  const raw = await transformers.RawImage.fromURL(canvas.toDataURL("image/png"));
  const { pixel_values } = await processor(raw);
  const output = await model({ input: pixel_values });
  const tensor = output.output ?? output.logits ?? Object.values(output)[0];
  const mask = await transformers.RawImage.fromTensor(tensor[0].mul(255).to("uint8")).resize(width, height);
  const pixels = ctx.getImageData(0, 0, width, height);
  let kept = 0;
  for (let i = 0; i < mask.data.length; i += 1) {
    const alpha = mask.data[i];
    if (alpha > 128) kept += 1;
    pixels.data[i * 4 + 3] = alpha;
  }
  // אם המודל לא זיהה דמות, מחזירים את התמונה בלי שינוי.
  if (kept / (width * height) < 0.01) return canvas.toDataURL("image/png");
  ctx.putImageData(pixels, 0, 0);
  return cropToSubject(canvas);
}

export async function removePhotoBackground(source) {
  showProgress("מכין את התמונה...", null);
  try {
    return await cutOut(source);
  } finally {
    hideProgress();
  }
}
