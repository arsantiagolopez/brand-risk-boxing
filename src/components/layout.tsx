import type { ReactNode } from "react";
import { Image } from "@/components/image";
import { cn } from "@/lib/utils";

type LayoutProps = {
  children: ReactNode;
  isNavActive?: boolean;
};

const Layout = ({ children, isNavActive }: LayoutProps) => {
  const navClasses = {
    interactive: "transition-all",
  };

  return (
    <div>
      <nav
        className={cn(
          "z-10 fixed top-0 flex items-center justify-center py-4 w-full",
          isNavActive && navClasses.interactive
        )}
      >
        <Image
          image="/assets/images/logo-bnw.webp"
          alt="Brand Risk Boxing"
          className="w-20"
        />
      </nav>
      <main>{children}</main>
      <footer></footer>
    </div>
  );
};

export { Layout };
