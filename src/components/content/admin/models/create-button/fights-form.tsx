import { useEffect, type Dispatch, type SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import useSWR, { mutate } from "swr";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { capitalize } from "@/lib/utils/string-helpers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

import { useFetch } from "@/lib/hooks/use-fetch";
import { fightSchema } from "../../forms";
import type { Card, Fight, Fighter } from "@/lib/db/schema";
import { isAfter, parseISO } from "date-fns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DetailedCard } from "@/components/detailed-card";
import { Input } from "@/components/ui/input";

type SchemaKeys = keyof z.infer<typeof fightSchema>;
type SchemaValue = z.ZodTypeAny;

type FightsFormProps = {
  name: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const FightsForm = ({ name, setOpen }: FightsFormProps) => {
  const [home, setHome] = useState<Fighter>();
  const [away, setAway] = useState<Fighter>();
  const [fighterFilterInput, setFighterFilterInput] = useState("");

  const { data: cards } = useSWR<Card[]>("/api/models/cards");
  const { data: fighters } = useSWR<Fighter[]>("/api/models/fighters");

  const schema = fightSchema;

  const defaultValues = {
    minutes: "3",
    rounds: "3",
  } as const;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
    reset,
    setValue,
    setError,
    getValues,
  } = form;

  const closeDialog = () => {
    reset(defaultValues);
    setOpen(false);
  };

  const onSubmit = async (values: z.infer<typeof schema>) => {
    if (!cards) {
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: "Try again in a few...",
      });
      closeDialog();
      return;
    }

    const card = cards.find(({ number }) => values.cardId === String(number));

    if (!card) {
      setError("cardId", {
        message: "Please choose a card number.",
      });
      return;
    }

    values.cardId = card.id;

    const { error } = await useFetch(
      "/api/models/fights",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      },
      {
        title: `❌ ${capitalize(name)} couldn't be created.`,
        description: "Try again in a few...",
      }
    );

    if (error) {
      closeDialog();
      return;
    }

    const mockFight = {
      ...values,
    } as Fight;

    await mutate<Fight[]>("/api/models/fights", async (data) => [
      ...(data || []),
      mockFight,
    ]);

    toast({
      title: `${capitalize(name)} successfully created.`,
    });

    closeDialog();
  };

  useEffect(() => {
    if (cards) {
      const upcomingCard = cards
        .filter((card) => isAfter(parseISO(card.date), new Date()))
        .sort(
          (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
        )?.[0];

      setValue("cardId", String(upcomingCard.number));
    }
  }, [cards]);

  console.log("😎😎😎 getValues: ", getValues());

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {Object.entries(schema.shape).map(([key, value]) => {
            const name = key as SchemaKeys;
            const schema = value as SchemaValue;

            return (
              <FormField
                key={name}
                control={control}
                name={name}
                render={({ field }) => {
                  let formField = null;
                  let homeField = null;
                  let awayField = null;

                  let label = name === "cardId" ? "card" : name;

                  switch (true) {
                    case name === "cardId":
                    case schema instanceof z.ZodEnum:
                      const enumValues: string[] =
                        (schema instanceof z.ZodEnum
                          ? schema.options
                          : cards?.map(({ number }) => String(number))) || [];

                      formField = (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder={`Select a ${name}`} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {enumValues.map((option) => {
                              const card =
                                name === "cardId"
                                  ? cards?.find(
                                      ({ number }) => option === String(number)
                                    )
                                  : undefined;
                              // const headline = `${capitalize(card.fights[0].home)} vs ${capitalize(card.fights[0].home)}`
                              // const postfix = card && ` – ${headline}`
                              const postfix = "";

                              return (
                                <SelectItem
                                  key={option}
                                  value={option}
                                  className="h-9"
                                >
                                  {capitalize(option)}
                                  {postfix}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      );
                      break;

                    case name === "homeId":
                      formField = <></>;
                      break;

                    case name === "homeId" || name === "awayId":
                      const getFilteredOptions = (isHome?: boolean) => {
                        return fighters?.filter(({ id, name }) => {
                          const lowercaseName = name.toLowerCase();
                          const lowercaseInput =
                            fighterFilterInput.toLowerCase();

                          const isSelected =
                            (isHome ? home?.id : away?.id) === id;
                          const nameMatches =
                            lowercaseName.includes(lowercaseInput);
                          const notSelectedAsOpponent =
                            id !== (isHome ? away?.id : home?.id);

                          return (
                            isSelected || (nameMatches && notSelectedAsOpponent)
                          );
                        });
                      };

                      const homeOptions = getFilteredOptions(true);
                      const awayOptions = getFilteredOptions();

                      const handleClick = (
                        fighter: Fighter,
                        isHome?: boolean
                      ) => {
                        if (isHome && home?.id === fighter.id)
                          return setHome(undefined);
                        if (!isHome && away?.id === fighter.id)
                          return setAway(undefined);

                        if (isHome) {
                          setHome(fighter);
                          setValue("homeId", fighter.id);
                        } else {
                          setAway(fighter);
                          setValue("awayId", fighter.id);
                        }
                      };

                      const selectedOverlay = (
                        <div className="absolute flex items-center justify-center w-full h-full backdrop-blur-sm">
                          <Check className="text-white text-7xl" />
                        </div>
                      );

                      homeField = (
                        <ScrollArea>
                          <div className="flex gap-3">
                            {homeOptions?.map((fighter) => {
                              const overlay =
                                home?.id === fighter.id && selectedOverlay;

                              return (
                                <button
                                  key={fighter.id}
                                  onClick={() => handleClick(fighter, true)}
                                  type="button"
                                >
                                  <DetailedCard
                                    item={fighter}
                                    aspectRatio="portrait"
                                    className="w-16 overflow-hidden"
                                    overlay={overlay}
                                    isSummary
                                  />
                                </button>
                              );
                            })}
                          </div>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      );

                      awayField = (
                        <ScrollArea>
                          <div className="flex gap-3">
                            {awayOptions?.map((fighter) => {
                              const overlay =
                                away?.id === fighter.id && selectedOverlay;

                              return (
                                <button
                                  key={fighter.id}
                                  onClick={() => handleClick(fighter)}
                                  type="button"
                                >
                                  <DetailedCard
                                    item={fighter}
                                    aspectRatio="portrait"
                                    className="w-16 overflow-hidden"
                                    overlay={overlay}
                                    isSummary
                                  />
                                </button>
                              );
                            })}
                          </div>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      );
                      break;
                  }

                  return (
                    <FormItem>
                      {name !== "awayId" && name !== "homeId" && (
                        <FormLabel className="text-sm">
                          {capitalize(label)}
                        </FormLabel>
                      )}

                      {name === "awayId" ? (
                        <div className="flex flex-col space-y-2">
                          <FormLabel className="text-sm">Fighters</FormLabel>
                          <Input
                            value={fighterFilterInput}
                            onChange={(event) =>
                              setFighterFilterInput(event.target.value)
                            }
                            placeholder="Filter fighters by name..."
                          />

                          <div className="flex gap-[6%]">
                            <div className="w-[47%] space-y-2">
                              <FormLabel className="text-sm">Home</FormLabel>
                              {homeField}
                            </div>

                            <div className="w-[47%] space-y-2">
                              <FormLabel className="text-sm">Away</FormLabel>
                              {awayField}
                            </div>
                          </div>
                        </div>
                      ) : (
                        formField
                      )}

                      {name !== "homeId" && <FormMessage className="text-xs" />}
                    </FormItem>
                  );
                }}
              />
            );
          })}
        </div>

        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Adding..." : `Add ${capitalize(name)}`}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export { FightsForm };
