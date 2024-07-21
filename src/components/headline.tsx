import type { Fighter } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { getFirstAndLastName } from "@/lib/utils/string-helpers";
import { useEffect, useState } from "react";

type HeadlineProps = {
  home: Fighter;
  away: Fighter;
  className?: string;
};

const Headline = ({ home, away, className }: HeadlineProps) => {
  const [fontSize, setFontSize] = useState("16");

  const headline = `${getFirstAndLastName(home.name).lastName} VS ${
    getFirstAndLastName(away.name).lastName
  }`;

  useEffect(() => {
    if (headline) {
      const adjustFontSize = () => {
        // Estimate the font size needed to make the text fill the width
        const screenWidth = window.innerWidth;
        const characterCount = headline.length;
        // This is a heuristic that you may need to adjust based on your font and preferences
        const newSize = Math.max(screenWidth / (characterCount * 0.31), 16); // Ensure a minimum font size
        setFontSize(`${newSize}px`);
      };

      // Adjust font size on mount and window resize
      adjustFontSize();
      window.addEventListener("resize", adjustFontSize);

      // Clean up
      return () => window.removeEventListener("resize", adjustFontSize);
    }
  }, [headline]);

  return (
    <h1 className={cn("font-magno uppercase", className)} style={{ fontSize }}>
      {headline}
    </h1>
  );
};

export { Headline };
