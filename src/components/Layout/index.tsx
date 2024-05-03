"use client";
import { StytchProvider } from "@stytch/nextjs";
import { createStytchUIClient } from "@stytch/nextjs/dist/index.ui";
import { ReactNode } from "react";
import useShowWindowSize from "@/hooks/useShowWindowSize";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const stytch = createStytchUIClient(
  process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN,
);

export type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps): JSX.Element {
  useShowWindowSize();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  return <StytchProvider stytch={stytch}>{children}</StytchProvider>;
}
