import useSWR from "swr";
import type { Fighter } from "../db/schema";

export const useFighters = () => {
  const { data, error, isLoading } = useSWR<Fighter[]>("/api/models/fighters");

  return {
    data,
    error,
    isLoading,
  };
};
