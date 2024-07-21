export const isValidEmail = (email: string): boolean => {
  return /.+@.+/.test(email);
};

export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9_]{1,18}[a-zA-Z0-9])?$/;
  return usernameRegex.test(username);
};
