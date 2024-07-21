import type { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { mutate } from "swr";

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
import { fighterSchema } from "../../forms";
import { Fighter } from "@/lib/db/schema";

type SchemaKeys = keyof z.infer<typeof fighterSchema>;
type SchemaValue = z.ZodTypeAny;

type FightersFormProps = {
  name: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const FightersForm = ({ name, setOpen }: FightersFormProps) => {
  const schema = fighterSchema;
  const defaultValues = {
    sex: "man",
    weight: 200,
    nationality: "United States",
    platform: "kick",
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
    watch,
  } = form;

  const closeDialog = () => {
    reset(defaultValues);
    setOpen(false);
  };

  const onSubmit = async (values: z.infer<typeof schema>) => {
    //#region – Upload Image to ImgBB to get URL
    try {
      const formData = new FormData();
      formData.append("image", values.image[0]);

      const uploadResponse = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });

      const data = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(data.error.message);
      }

      values.image = data.url;
    } catch (error) {
      console.error(`❌ Error uploading the image to Imgbb:`, error);
      return;
    }
    //#endregion

    //#region – Create an instance in the database
    const { error } = await useFetch(
      "/api/models/fighters",
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

    const mockFighter = {
      image: values.image,
      name: values.name,
      nickname: values.nickname,
    } as Fighter;

    await mutate<Fighter[]>("/api/models/fighters", async (data) => [
      ...(data || []),
      mockFighter,
    ]);

    toast({
      title: `${capitalize(name)} successfully created.`,
    });

    closeDialog();
    //#endregion
  };

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

                  const nameToLabel: Partial<Record<SchemaKeys, string>> = {
                    platformUsername: `${watch("platform")} username`,
                  };

                  let label = nameToLabel[name] || name;

                  switch (true) {
                    case schema instanceof z.ZodEffects:
                      let { value: _, onChange, ...props } = field;

                      formField = (
                        <FormControl>
                          <Input
                            type="file"
                            onChange={(event) => {
                              onChange(event.target.files);
                            }}
                            {...props}
                          />
                        </FormControl>
                      );
                      break;

                    case schema instanceof z.ZodEnum:
                      const enumValues: string[] = schema.options;
                      field.value = String(field.value);

                      formField = (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder={`Select the ${name}`} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {enumValues.map((option) => (
                              <SelectItem
                                key={option}
                                value={option}
                                className="h-9"
                              >
                                <span className="flex items-center gap-2.5">
                                  {key === "platform" && (
                                    <Image
                                      src={`/assets/images/platforms/${option}_logo.avif`}
                                      alt={option}
                                      width={14}
                                      height={14}
                                      className="aspect-square"
                                    />
                                  )}
                                  {capitalize(option)}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                      break;

                    default:
                      //#region – Conditional `platformUsername` render based on `platform` value
                      const shouldShowUsernameField =
                        watch("platform") !== "none";

                      if (
                        key === "platformUsername" &&
                        !shouldShowUsernameField
                      ) {
                        return <></>;
                      }

                      if (key === "platformUsername") {
                        optional = false;
                      }
                      //#endregion

                      // Input fields
                      let { value, ...inputProps } = field;
                      value = value instanceof Date ? undefined : value;

                      const type =
                        schema instanceof z.ZodNumber ? "number" : "text";

                      formField = (
                        <FormControl>
                          <Input type={type} value={value} {...inputProps} />
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

export { FightersForm };
