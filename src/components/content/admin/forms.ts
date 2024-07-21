import { platformNames } from "@/lib/constants";
import { z } from "zod";

export const cardSchema = z.object({
  number: z.number({
    required_error: "Number is required.",
  }),
  date: z.date({
    required_error: "Date is required.",
  }),
  location: z.string({
    required_error: "Location is required.",
  }),
});

export const fightSchema = z.object({
  cardId: z.string({ required_error: "Please choose a card number." }),
  homeId: z.string({
    required_error: "Please choose both home and away fighters. ",
  }),
  awayId: z.string({
    required_error: "Please choose both home and away fighters. ",
  }),
  minutes: z.enum(["1", "2", "3", "4", "5"], {
    errorMap: () => ({
      message: "Minutes must be one of '1', '2', '3', '4', '5'.",
    }),
  }),
  rounds: z.enum(["3", "5"], {
    errorMap: () => ({ message: "Rounds must be either '3' or '5'." }),
  }),
});

export const fighterSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters long.",
  }),
  nickname: z.string().optional(),
  sex: z.enum(["man", "woman"], {
    errorMap: () => ({
      message: "Sex must be either 'man' or 'woman'.",
    }),
  }),
  weight: z.coerce.number({
    invalid_type_error: "Weight must be a number.",
    required_error: "Weight is required.",
  }),
  nationality: z.string({
    invalid_type_error: "Nationality must be a string.",
    required_error: "Nationality is required.",
  }),
  image: z
    .any()
    .refine(
      (fileList: FileList | null | undefined) => {
        return fileList && fileList.length > 0;
      },
      {
        message: "Image is required",
      }
    )
    .refine(
      (fileList: FileList) => {
        const file = fileList?.[0];
        return file ? file.size <= 1048576 * 10 : true;
      },
      {
        message: "Image must be smaller than 10MB",
      }
    )
    .refine(
      (fileList: FileList) => {
        const file = fileList?.[0];
        return file ? file.type?.startsWith("image/") : true;
      },
      {
        message: "Only image files are allowed",
      }
    ),
  platform: z.enum(platformNames, {
    errorMap: () => ({
      message: "A Platform selection is required.",
    }),
  }),
  platformUsername: z.string().optional(),
});
