import useSWR from "swr";
import type { Card } from "../db/schema";

export const useCards = () => {
  const { data, error, isLoading } = useSWR<Card[]>("/api/models/cards");

  return {
    data,
    error,
    isLoading,
  };
};
