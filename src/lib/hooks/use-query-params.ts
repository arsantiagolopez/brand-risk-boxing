import { useSearchParams } from "next/navigation";

type UseQueryParams<T extends string> = {
  queryKey: string;
  defaultKey: T;
  optionKeys: T[];
};

export const useQueryParams = <T extends string>({
  queryKey,
  defaultKey,
  optionKeys,
}: UseQueryParams<T>): T => {
  const queryParams = useSearchParams();
  const param = queryParams.get(queryKey);

  const isValidKey = (key: string | null): key is T => {
    return key !== null && optionKeys.includes(key as T);
  };

  if (isValidKey(param)) {
    return param;
  }

  return defaultKey;
};
