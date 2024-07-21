export const capitalize = (input: string): string => {
  return input
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const getFirstAndLastName = (name: string) => {
  const words = name.trim().split(/\s+/);
  const firstName = words[0];
  const lastName = words.slice(1).join(" ") || firstName;

  return { firstName, lastName };
};
