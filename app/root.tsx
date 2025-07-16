import { NextUIProvider } from "@nextui-org/react";
import type { LinksFunction } from "@remix-run/node";
import "aos/dist/aos.css";
import aosStyles from 'aos/dist/aos.css';
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
import AOS from "aos";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: aosStyles },

];





export default function App() {
  useEffect(() => {
    AOS.init({
      duration: 2000,
      once: false,
      offset: 120,
    });
  }, []);
  return (
    <html lang="en">
      <head>

        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />

        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-9QRHMBT0GY"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-9QRHMBT0GY');
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider defaultTheme="light" attribute="class">
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
