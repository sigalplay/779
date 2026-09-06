let segmenterPromise;

async function getSegmenter() {
  if (!segmenterPromise) {
    segmenterPromise = import("@mediapipe/selfie_segmentation").then(({ SelfieSegmentation }) => {
      const segmenter = new SelfieSegmentation({
        locateFile: (file) => `/mediapipe/selfie_segmentation/${file}`,
      });
      segmenter.setOptions({ modelSelection: 0, selfieMode: false });
      return segmenter;
    });
  }
  return segmenterPromise;
}

export async function preparePhotoForCropLocally(file) {
  const image = await loadImage(file);
  const maxSide = 1200;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.9);
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("IMAGE_LOAD_FAILED")); };
    image.src = url;
  });
}

function headPortraitPngDataUrl(canvas) {
  const ctx = canvas.getContext("2d");
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let left = canvas.width;
  let top = canvas.height;
  let right = -1;
  let bottom = -1;
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
  // The story character needs a head portrait rather than the whole uploaded body.
  // A square taken from the top of the segmented person reliably keeps the face and
  // hair for the requested front-facing face-and-shoulders photos, without uploading
  // anything to a face-detection service.
  const subjectWidth = right - left + 1;
  const subjectHeight = bottom - top + 1;
  const cropSize = Math.min(canvas.width, canvas.height, Math.max(subjectWidth, Math.min(subjectHeight, subjectWidth * 1.12)));
  const centerX = (left + right) / 2;
  left = Math.max(0, Math.round(centerX - cropSize / 2));
  right = Math.min(canvas.width - 1, Math.round(left + cropSize - 1));
  left = Math.max(0, right - Math.round(cropSize) + 1);
  top = Math.max(0, top - Math.round(cropSize * 0.04));
  bottom = Math.min(canvas.height - 1, top + Math.round(cropSize) - 1);
  const output = document.createElement("canvas");
  output.width = right - left + 1;
  output.height = bottom - top + 1;
  output.getContext("2d").drawImage(canvas, left, top, output.width, output.height, 0, 0, output.width, output.height);
  return output.toDataURL("image/png");
}

function applyCleanSegmentationMask(image, segmentationMask, width, height) {
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = width;
  sourceCanvas.height = height;
  const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
  sourceContext.drawImage(image, 0, 0, width, height);
  const sourcePixels = sourceContext.getImageData(0, 0, width, height);

  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskContext = maskCanvas.getContext("2d", { willReadFrequently: true });
  maskContext.drawImage(segmentationMask, 0, 0, width, height);
  const maskPixels = maskContext.getImageData(0, 0, width, height).data;

  const pixels = sourcePixels.data;
  const featherStart = 0.42;
  const solidAt = 0.72;
  for (let index = 0; index < pixels.length; index += 4) {
    const confidence = (maskPixels[index] + maskPixels[index + 1] + maskPixels[index + 2]) / (3 * 255);
    const normalized = Math.max(0, Math.min(1, (confidence - featherStart) / (solidAt - featherStart)));
    const smoothAlpha = normalized * normalized * (3 - 2 * normalized);
    pixels[index + 3] = Math.round(pixels[index + 3] * smoothAlpha);
  }

  const output = document.createElement("canvas");
  output.width = width;
  output.height = height;
  output.getContext("2d").putImageData(sourcePixels, 0, 0);
  return output;
}

export async function removePhotoBackgroundLocally(file) {
  const image = await loadImage(file);
  const maxSide = 720;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const segmenter = await Promise.race([
    getSegmenter(),
    new Promise((_, reject) => window.setTimeout(() => reject(new Error("SEGMENTER_LOAD_TIMEOUT")), 10000)),
  ]);

  return new Promise((resolve, reject) => {
    let settled = false;
    const timeout = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error("SEGMENTATION_TIMEOUT"));
    }, 12000);
    segmenter.onResults((results) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      try {
        const canvas = applyCleanSegmentationMask(image, results.segmentationMask, width, height);
        resolve(headPortraitPngDataUrl(canvas));
      } catch (error) { reject(error); }
    });
    segmenter.send({ image }).catch((error) => {
      window.clearTimeout(timeout);
      reject(error);
    });
  });
}
