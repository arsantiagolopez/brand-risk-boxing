import { Skeleton } from "../ui/skeleton";
import { aspectClasses } from ".";
import { cn } from "@/lib/utils";

type DetailedCardSkeletonProps = {
  className?: string;
  aspectRatio?: "portrait" | "square";
};

const DetailedCardSkeleton = ({
  className,
  aspectRatio = "square",
}: DetailedCardSkeletonProps) => {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton
        className={cn("rounded-xl", className, aspectClasses[aspectRatio])}
      />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
};

export { DetailedCardSkeleton };
