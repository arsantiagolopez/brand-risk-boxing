import { cn } from "@/lib/utils";
import { isCard, isFight, isFighter } from "@/lib/utils/typeguards";
import { DetailedCardSkeleton } from "./detailed-card-skeleton";
import { Image } from "../image";
import { format } from "date-fns";
import type { ReactNode } from "react";
import { getFirstAndLastName } from "@/lib/utils/string-helpers";

export const aspectClasses = {
  portrait: "aspect-[3/4]",
  square: "aspect-square",
};

export type DetailedCardProps<T> = {
  item: T;
  className?: string;
  aspectRatio?: "portrait" | "square";
  isSummary?: boolean;
  overlay?: ReactNode;
};

const DetailedCard = <T,>({
  item,
  className,
  aspectRatio = "square",
  isSummary,
  overlay,
}: DetailedCardProps<T>) => {
  let image: string | null = null;
  let title: string | null = null;
  let subtitle: string | null = null;

  let customClasses = "";
  const homeName =
    isFight(item) && getFirstAndLastName(item.home.name).lastName;
  const awayName =
    isFight(item) && getFirstAndLastName(item.away.name).lastName;
  const headline = `${homeName} vs ${awayName}`;

  if (isCard(item)) {
    image = "/assets/images/logo-bnw.webp";
    title = `Card #${item.number}`;
    subtitle = `${format(item.date, "MMM. do")}, ${item.location}`;
    customClasses = "blur-[3px]";
  }

  if (isFight(item)) {
    image = "/assets/images/missing_image_placeholder.png";
    title = headline;
    subtitle = `BRP #${item.card.number} – ${format(
      item.card.date,
      "MMM. do"
    )}`;
    customClasses = "blur-[3px]";
  }

  if (isFighter(item)) {
    image = item.image;
    title = item.name;
    subtitle = item.nickname;
  }

  if (!image || !title) {
    return (
      <DetailedCardSkeleton aspectRatio={aspectRatio} className={className} />
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", isSummary && "gap-1", className)}>
      <div className="relative flex items-center justify-center overflow-hidden rounded-md">
        {isCard(item) && (
          <div className="z-10 absolute italic text-white text-right">
            <p className="text-4xl font-black">BRP</p>
            <p className="text-2xl font-bold leading-4 mr-2">{item.number}</p>
          </div>
        )}
        {isFight(item) ? (
          <span
            className={cn(
              "flex items-center justify-center h-full w-full grayscale transition-all hover:scale-105",
              aspectClasses[aspectRatio]
            )}
          >
            <span className="absolute italic font-black text-xl px-8 mt-3 w-full select-none">
              <p className="uppercase text-left leading-3">
                {homeName} <span className="mx-2">vs</span>
              </p>
              <p className="uppercase text-right">{awayName}</p>
            </span>
            <span className="h-full">
              <Image
                image={item.home.image}
                alt={item.home.name}
                className="h-1/2 w-full object-cover"
              />
              <Image
                image={item.away.image}
                alt={item.away.name}
                className="h-1/2 w-full object-cover"
              />
            </span>
          </span>
        ) : (
          <Image
            image={image}
            alt={title}
            className={cn(
              "h-full w-full object-cover transition-all hover:scale-105",
              aspectClasses[aspectRatio],
              customClasses
            )}
          />
        )}
        {overlay}
      </div>

      <div className="flex flex-col text-left text-xs gap-1">
        <h4
          className={cn(
            "font-medium leading-none truncate",
            isSummary && "text-xs text-muted-foreground"
          )}
        >
          {title}
        </h4>
        {!isSummary && subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export { DetailedCard };
