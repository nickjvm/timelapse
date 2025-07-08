export default function compressAndEncodeFile(
  file: File,
  maxSize: number,
  quality = 0.8,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
        // Set canvas dimensions (optional: resize image here)
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to Blob with compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Convert compressed Blob to Base64
              const blobReader = new FileReader();
              blobReader.onloadend = () => {
                resolve(blobReader.result as string); // Base64 string
              };
              blobReader.onerror = reject;
              blobReader.readAsDataURL(blob);
            } else {
              reject(new Error("Canvas to Blob conversion failed."));
            }
          },
          "image/jpeg",
          quality,
        ); // Adjust mimeType and quality as needed
      };
      img.onerror = reject;
      img.src = event.target?.result as string; // DataURL of the original file
    };
    reader.onerror = reject;
    reader.readAsDataURL(file); // Read original file as DataURL
  });
}
