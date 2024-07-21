import useSWR from "swr";
import type { Fight } from "../db/schema";

export const useFights = () => {
  const { data, error, isLoading } = useSWR<Fight[]>("/api/models/fights");

  return {
    data,
    error,
    isLoading,
  };
};
