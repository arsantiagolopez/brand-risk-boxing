import { providers, socialProviders } from "@/lib/constants";

export type SocialProvider = (typeof socialProviders)[number];
export type Provider = (typeof providers)[number];

export type Config = {
  db: {
    host: string;
    port: number;
    name: string;
    user: string;
    pass: string;
  };
  auth: {
    successRedirectUrl: `/${string}`;
    socials: Record<
      SocialProvider,
      {
        clientId: string;
        clientSecret: string;
        redirectURI?: string;
      }
    >;
  };
  misc: Record<string, string>;
};

export type GoogleUser = {
  sub: string;
  email: string;
  name: string;
  picture: string;
};
