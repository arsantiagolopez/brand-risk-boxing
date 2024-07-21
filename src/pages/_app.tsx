import type { AppProps } from "next/app";
import { ThemeProvider } from "@/context/theme-provider";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SWRConfig } from "swr";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <SWRConfig
      value={{
        refreshInterval: 3000,
        fetcher: (resource, init) =>
          fetch(resource, init).then((res) => res.json()),
      }}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Component {...pageProps} />
        <Toaster />
      </ThemeProvider>
    </SWRConfig>
  );
};

export default App;
