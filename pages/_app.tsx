import { AppProps } from "next/app";
import Head from "next/head";
import { MantineProvider } from "@mantine/core";
import { hotjar } from "react-hotjar";
import { useEffect } from "react";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;
  useEffect(() => {
    hotjar.initialize(3443776, 6);
  }, []);

  return (
    <>
      <Head>
        <title>Melmy</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: "light",
        }}
      >
        <Component {...pageProps} />
      </MantineProvider>
    </>
  );
}
