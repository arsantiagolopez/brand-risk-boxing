import { useEffect, type Dispatch, type SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/date-picker";
import { capitalize } from "@/lib/utils/string-helpers";
import { toast } from "@/components/ui/use-toast";

import { useFetch } from "@/lib/hooks/use-fetch";
import { cardSchema } from "../../forms";
import { Card } from "@/lib/db/schema";

type SchemaKeys = keyof z.infer<typeof cardSchema>;
type SchemaValue = z.ZodTypeAny;

type CardsFormProps = {
  name: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const CardsForm = ({ name, setOpen }: CardsFormProps) => {
  const { data: cards } = useSWR<Card[]>("/api/models/cards");

  const schema = cardSchema;

  const defaultValues = {
    location: "Miami",
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
  } = form;

  const closeDialog = () => {
    reset(defaultValues);
    setOpen(false);
  };

  const onSubmit = async (values: z.infer<typeof schema>) => {
    const { error } = await useFetch("/api/models/cards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (error) {
      closeDialog();
      return;
    }

    const mockCard = {
      number: values.number,
      date: String(values.date),
      location: values.location,
    } as Card;

    await mutate<Card[]>("/api/models/cards", async (data) => [
      ...(data || []),
      mockCard,
    ]);

    toast({
      title: `${capitalize(name)} successfully created.`,
    });

    closeDialog();
  };

  useEffect(() => {
    if (cards) {
      const latestCardNumber =
        cards.sort((a, b) => a.number - b.number)[0]?.number || 0;
      setValue("number", latestCardNumber + 1);
    }
  }, [cards]);

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
                  let optional = schema instanceof z.ZodOptional;
                  let formField = null;

                  let label = name;

                  let { value, ...inputProps } = field;

                  switch (true) {
                    case schema instanceof z.ZodDate:
                      formField = (
                        <FormControl>
                          <DatePicker
                            selected={
                              field.value instanceof Date
                                ? field.value
                                : undefined
                            }
                            onSelect={field.onChange}
                          />
                        </FormControl>
                      );
                      break;

                    case schema instanceof z.ZodNumber:
                      let { onChange, ...restProps } = inputProps;
                      formField = (
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            value={
                              typeof value === "number" ? value : undefined
                            }
                            onChange={(event) => {
                              onChange(parseFloat(event.target.value));
                            }}
                            {...restProps}
                          />
                        </FormControl>
                      );
                      break;

                    default:
                      formField = (
                        <FormControl>
                          <Input
                            type="text"
                            value={
                              typeof value === "string" ? value : undefined
                            }
                            {...inputProps}
                          />
                        </FormControl>
                      );

                      break;
                  }

                  return (
                    <FormItem>
                      <FormLabel className="text-sm">
                        {capitalize(label)}
                        {optional && " (optional)"}
                      </FormLabel>

                      {formField}

                      <FormMessage className="text-xs" />
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

export { CardsForm };
