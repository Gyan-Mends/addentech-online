import { NextUIProvider } from "@nextui-org/react";
import type { LinksFunction } from "@remix-run/node";
import "aos/dist/aos.css";
import AOS from "aos";
import { ThemeProvider } from "next-themes";


import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import stylesheet from "~/tailwind.css";
import { useEffect } from "react";
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];



export default function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000, // Customize as needed
    });
  }, []);
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider defaultTheme="dark" attribute="class">
          <NextUIProvider>
            <Outlet />
          </NextUIProvider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
