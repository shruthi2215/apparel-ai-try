const MAX_AI_IMAGE_DIMENSION = 768;
const JPEG_QUALITY = 0.78;

/** Converts browser-supported image formats (including WebP) to a compact JPEG. */
export async function imageForAi(source: string): Promise<string> {
  const image = new Image();
  image.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("This image could not be read. Please use a clear JPG or PNG photo."));
    image.src = source;
  });

  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  if (!sourceWidth || !sourceHeight) {
    throw new Error("This image has no readable dimensions. Please use a clear JPG or PNG photo.");
  }

  const scale = Math.min(1, MAX_AI_IMAGE_DIMENSION / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not prepare this image. Please try another photo.");

  context.drawImage(image, 0, 0, width, height);
  try {
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } catch {
    throw new Error("This image cannot be processed securely. Please upload a JPG or PNG photo.");
  }
}