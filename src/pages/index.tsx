import { Headline } from "@/components/headline";
import { Layout } from "@/components/layout";
import { Image } from "@/components/image";
import useSWR from "swr";
import type { Card } from "@/lib/db/schema";
import { Screen } from "@/components/screen";
import { useEffect } from "react";

type HomePageProps = {};

const HomePage = ({}: HomePageProps) => {
  const { data: card } = useSWR<Card[]>("/api/models/cards");

  const firstFight = card?.[0].fights[0];
  const { home, away } = firstFight || {};

  // Set `active` className to page snapped in view
  useEffect(() => {
    let callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          entry.target.classList.remove("active");
        } else {
          entry.target.classList.add("active");
        }
      });
    };

    let options = {
      threshold: 0.5,
    };

    let observer = new IntersectionObserver(callback, options);

    /* Target all section elements */
    document
      .querySelectorAll("section")
      .forEach((section) => observer.observe(section));
  }, [card]);

  if (!home || !away) {
    return null;
  }

  return (
    <Layout>
      <div className="snap-y snap-mandatory h-[100dvh] overflow-scroll w-screen no-scrollbar">
        <Screen className="flex items-center justify-center bg-[#212121]">
          {/* <Countdown /> */}
          <Image
            image={home.image}
            alt={home.name}
            className="absolute -translate-x-1/4 sm:-translate-x-1/2 lg:-translate-x-full grayscale"
          />
          <Image
            image={away.image}
            alt={away.name}
            className="absolute translate-x-1/4 sm:translate-x-1/2 lg:translate-x-full grayscale"
          />
          <Headline
            home={home}
            away={away}
            className="z-20 absolute bottom-0"
          />
        </Screen>

        <Screen className="flex items-center justify-center bg-white">
          <Image
            image={home.image}
            alt={home.name}
            className="absolute -translate-x-1/4 sm:-translate-x-1/2 lg:-translate-x-full grayscale"
          />
          <Image
            image={away.image}
            alt={away.name}
            className="absolute translate-x-1/4 sm:translate-x-1/2 lg:translate-x-full grayscale"
          />
          <Headline
            home={home}
            away={away}
            className="z-20 absolute bottom-0"
          />
        </Screen>
      </div>
    </Layout>
  );
};

export default HomePage;
