export const socialProviders = ["google"] as const;
export const providers = ["local", ...socialProviders] as const;

export const platforms = [
  { id: "kick", label: "Kick", url: "https://kick.com" },
  { id: "rumble", label: "Rumble", url: "https://rumble.com" },
  { id: "twitch", label: "Twitch", url: "https://twitch.tv" },
  { id: "youtube", label: "YouTube", url: "https://youtube.com" },
  { id: "other", label: "Other" },
] as const;

export const platformNames = platforms.map(({ id }) => id) as [
  string,
  ...string[]
];
