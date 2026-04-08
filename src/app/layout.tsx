import "~/styles/globals.css";

import { type Metadata } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import { MsalProvider } from "~/components/auth/MsalProvider";

export const metadata: Metadata = {
  title: "Graph Explorer Plus",
  description: "A power-user Microsoft Graph API explorer",
  icons: [
    { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
    { rel: "icon", url: "/favicon.ico", sizes: "any" },
  ],
};

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`dark ${instrumentSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Theme loader: prevents flash of wrong theme on page load.
          SECURITY: Safe because (1) no user input interpolated,
          (2) only "light" value accepted, (3) only CSS classes modified.
          Do NOT modify to read URL parameters or other untrusted input.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("gep-theme");if(t==="light"||(!t&&window.matchMedia("(prefers-color-scheme: light)").matches)){document.documentElement.classList.remove("dark");document.documentElement.classList.add("light");document.documentElement.style.colorScheme="light"}}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <MsalProvider>{children}</MsalProvider>
        <Analytics />
      </body>
    </html>
  );
}
