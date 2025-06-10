import React, { useEffect } from "react";

const ShareModal = ({ videoUrl, onClose }) => {
  useEffect(() => {
    if (navigator.share) {
      navigator
        .share({
          title: "Check out this video!",
          url: videoUrl,
        })
        .catch((error) => {
          console.error("Error sharing:", error);
        })
        .finally(() => {
          if (onClose) onClose();
        });
    } else {
      alert("Web Share API is not supported in this browser.");
      if (onClose) onClose();
    }
    // eslint-disable-next-line
  }, []);

  return null;
};

export default ShareModal; 