let segmenterPromise;

async function getSegmenter() {
  if (!segmenterPromise) {
    segmenterPromise = import("@mediapipe/selfie_segmentation").then(({ SelfieSegmentation }) => {
      const segmenter = new SelfieSegmentation({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1.1675465747/${file}`,
      });
      segmenter.setOptions({ modelSelection: 0, selfieMode: false });
      return segmenter;
    });
  }
  return segmenterPromise;
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

export async function removePhotoBackgroundLocally(file) {
  const image = await loadImage(file);
  const maxSide = 720;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const segmenter = await getSegmenter();

  return new Promise((resolve, reject) => {
    let settled = false;
    segmenter.onResults((results) => {
      if (settled) return;
      settled = true;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(results.segmentationMask, 0, 0, width, height);
        ctx.globalCompositeOperation = "source-in";
        ctx.drawImage(image, 0, 0, width, height);
        ctx.globalCompositeOperation = "source-over";
        resolve(headPortraitPngDataUrl(canvas));
      } catch (error) { reject(error); }
    });
    segmenter.send({ image }).catch(reject);
  });
}
