import { cn } from "@/lib/utils";
import { DetailedCardProps } from "./detailed-card";
import { Plus } from "iconoir-react";

type DetailedCardPlaceholderProps = {
  type: string;
  className?: string;
  aspectRatio?: DetailedCardProps["aspectRatio"];
};

const DetailedCardPlaceholder = ({
  type,
  className,
  aspectRatio = "square",
}: DetailedCardPlaceholderProps) => {
  const aspectClasses = {
    portrait: "aspect-[3/4]",
    square: "aspect-square",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-10 text-center",
        className,
        aspectClasses[aspectRatio]
      )}
    >
      <Plus />
      <p className="text-lg font-semibold tracking-tight">No {type} added</p>
      <p className="text-xs text-muted-foreground">
        You haven't added any {type}. Click here to add one.
      </p>
    </div>
  );
};

export { DetailedCardPlaceholder };
