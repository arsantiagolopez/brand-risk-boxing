import { Separator } from "@/components/ui/separator";

import { Toggle } from "@/components/ui/toggle";
import { ViewGrid } from "iconoir-react";

import { Sidebar } from "../sidebar";
import { CreateModelButton } from "@/components/content/admin/models/create-button/create-button";
import { useSearchParams } from "next/navigation";
import { useQueryParams } from "@/lib/hooks/use-query-params";
import { useModel } from "@/lib/hooks/use-model";
import { DetailedCard } from "@/components/detailed-card";
import { DetailedCardSkeleton } from "@/components/detailed-card/detailed-card-skeleton";

const DEFAULT_MODEL = "cards";

export const modelData = {
  cards: {
    name: "card",
    subtitle: "Upcoming events.",
  },
  fights: {
    name: "fight",
    subtitle: "Upcoming events.",
  },
  fighters: {
    name: "fighter",
    subtitle: "Relevant fighters.",
  },
  // results: {
  //   name: "result",
  //   subtitle: "Upcoming events.",
  // },
};

const modelKeys = Object.keys(modelData) as Model[];
export type Model = keyof typeof modelData;

type ModelsContentProps = {};

const ModelsContent = ({}: ModelsContentProps) => {
  const params = useSearchParams();
  const model = useQueryParams({
    queryKey: "model",
    defaultKey: DEFAULT_MODEL,
    optionKeys: modelKeys,
  });

  const { data, isLoading } = useModel(model);

  console.log("😎😎😎 data: ", data);

  const name = modelData[model].name;
  const subtitle = modelData[model].subtitle;

  return (
    <div className="bg-background p-10 overflow-hidden">
      <div className="grid lg:grid-cols-5 border rounded-lg">
        <Sidebar model={model} className="hidden lg:block" />

        <div className="col-span-3 lg:col-span-4 lg:border-l">
          <div className="h-full px-4 py-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="first-letter:uppercase">{model}</h2>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <Toggle variant="outline" aria-label="Toggle table">
                  <ViewGrid className="h-4 w-4" />
                </Toggle>
                {params.get("model") && (
                  <CreateModelButton model={model}>
                    Create a {name}
                  </CreateModelButton>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Content with tables below */}
            <div className="flex items-start gap-4 w-full overflow-hidden">
              {isLoading ? (
                <div className="flex gap-4 overflow-scroll">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <DetailedCardSkeleton
                      key={index}
                      aspectRatio="portrait"
                      className="w-48"
                    />
                  ))}
                </div>
              ) : data ? (
                data.map((item, index) => (
                  <DetailedCard
                    key={item.id || index}
                    item={item}
                    aspectRatio="portrait"
                    className="w-48"
                  />
                ))
              ) : null}
            </div>

            <div className="mt-6 flex flex-col gap-1">
              <h2>Previous {model}</h2>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>

            <Separator className="my-4" />

            <div className="relative">{/* Tables */}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ModelsContent };
