import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ScreenProps = {
  children: ReactNode;
  className?: string;
};

const Screen = ({ children, className }: ScreenProps) => {
  const transitionClasses = `opacity-0 transition-opacity duration-[2000ms]`;

  return (
    <section
      className={cn(
        "relative snap-start h-[100dvh] w-screen overflow-hidden",
        transitionClasses,
        className
      )}
    >
      {children}
    </section>
  );
};

export { Screen };
