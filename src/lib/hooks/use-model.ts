// @unused

import useSWR from "swr";
import type { Card, Fight, Fighter } from "../db/schema";

type ModelDataType<T> = T extends "cards"
  ? Card
  : T extends "fights"
  ? Fight
  : T extends "fighters"
  ? Fighter
  : never;

export const useModel = <T>(model: T) => {
  const { data, error, isLoading } = useSWR<ModelDataType<T>[]>(
    `/api/models/${model}`
  );

  return {
    data,
    error,
    isLoading,
  };
};
