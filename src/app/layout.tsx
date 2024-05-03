// eslint-disable-next-line filenames/match-exported
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/theme-dark.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import type { Metadata } from "next";
import { Noto_Sans_JP as NotoSansJP } from "next/font/google";
import "react-tabs/style/react-tabs.css";
import "ress";
import "./globals.scss";
import Layout from "@/components/Layout";
import NextTopLoader from "@/components/NextTopLoader";

const notoSansJP = NotoSansJP({ subsets: ["latin"] });

export const metadata: Metadata = {
  description: "",
  title: "YouTube Music Player",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="ja">
      <body className={notoSansJP.className}>
        <NextTopLoader />
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
