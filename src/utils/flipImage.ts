type FlipDirection = "horizontal" | "vertical";

export function flipImage(
  imageData: string,
  direction: FlipDirection,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // Save the current canvas state
      ctx.save();

      // Move to the center of the canvas
      ctx.translate(
        direction === "horizontal" ? img.width : 0,
        direction === "vertical" ? img.height : 0,
      );

      // Flip the canvas horizontally or vertically
      ctx.scale(
        direction === "horizontal" ? -1 : 1,
        direction === "vertical" ? -1 : 1,
      );

      // Draw the image
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // Restore the canvas state
      ctx.restore();

      // Convert to base64
      try {
        const flippedImage = canvas.toDataURL("image/jpeg");
        resolve(flippedImage);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    // Set the image source
    img.src = imageData;
  });
}
