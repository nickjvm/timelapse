import { useEffect, useState } from "react";

export default function PrivacyDisclaimer() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!document.cookie.includes("privacy_disclaimer=true")) {
      setShow(true);
    }
  }, []);

  const onClick = () => {
    document.cookie = "privacy_disclaimer=true; path=/; max-age=31536000";
    setShow(false);
  };
  if (!show) {
    return null;
  }

  return (
    <div className="p-4 max-w-5xl mx-auto my-2">
      <div className="rounded border border-neutral-200 p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div>
          <h3 className="font-bold mb-2">Head&apos;s up!</h3>
          <p>
            The photos you upload are completely private. Images are not stored
            on any servers and are only processed in your browser. What you do
            with any exported timelines, videos or images is entirely up to you,
            of course 😜.
          </p>
        </div>
        <button
          className="w-full sm:w-auto justify-center sm:mt-8 whitespace-nowrap border border-neutral-200 bg-neutral-100 rounded text-neutral-700 hover:bg-blue-500 hover:text-white hover:border-blue-600 transition-colors"
          onClick={onClick}
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
