/**
 * Shrink a photo in the browser before uploading. Phone photos are often 3–10 MB
 * (and HEIC on iPhone); a resized JPEG is a few hundred KB and works everywhere.
 */
export async function resizeImage(file: Blob, maxSize: number, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser can’t process images.");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Couldn’t process that photo."))),
      "image/jpeg",
      quality,
    ),
  );
}

/** A full-size photo and a grid thumbnail, ready to upload. */
export async function preparePhoto(file: File): Promise<{ photo: Blob; thumbnail: Blob }> {
  const [photo, thumbnail] = await Promise.all([resizeImage(file, 1600), resizeImage(file, 480, 0.8)]);
  return { photo, thumbnail };
}
