import { toast } from "@/components/ui/use-toast";

type ErrorToast = {
  title?: string;
  description?: string;
};

type MutationResponse = {
  data?: Response;
  error?: unknown;
};

const useFetch = async (
  input: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1],
  errorToast?: ErrorToast
): Promise<MutationResponse> => {
  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error);
    }

    return {
      data: await response.json(),
    };
  } catch (error) {
    const title =
      errorToast?.title ||
      (error instanceof Error && error.message) ||
      "Something's not quite right. Try again later.";
    const description = errorToast?.description;

    toast({
      variant: "destructive",
      title,
      description,
    });

    return {
      error,
    };
  }
};

export { useFetch };
