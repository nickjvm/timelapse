import { toPng } from "html-to-image";

// inspired by https://github.com/bubkoo/html-to-image/issues/361#issuecomment-2962494203
// Safari has issues where occasionally img tags are not loaded when added to the canvas
// this seems to work for now by retrying a few times in safari and checking to see
// if there is a significant increase in the size of dataUrl.length between cycles. If so,
// assume the image loaded and exit the loop
// if not safari, then just try once.
export default async function buildPng(el: HTMLElement) {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  let dataUrl = "";
  let attempts = 0;
  let maxAttempts;
  if (isSafari) {
    maxAttempts = 5;
  } else {
    maxAttempts = 1;
  }
  const cycle = [];
  let repeat = true;

  while (repeat && attempts < maxAttempts) {
    dataUrl = await toPng(el, {
      fetchRequestInit: {
        cache: "no-cache",
      },
      skipAutoScale: true,
    });
    attempts += 1;
    cycle[attempts] = dataUrl.length;

    if (isSafari && attempts > 1) {
      const currentSize = cycle[attempts];
      const previousSize = cycle[attempts - 1];
      const percentIncrease =
        ((currentSize - previousSize) / previousSize) * 100;

      // Only stop if there's a SIGNIFICANT increase (>50%)
      if (percentIncrease > 50) {
        repeat = false;
      }
    }
  }

  return dataUrl;
}
