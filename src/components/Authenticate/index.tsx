"use client";
import { useStytch, useStytchUser } from "@stytch/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Oval } from "react-loader-spinner";
import styles from "./style.module.scss";
import useRouter from "@/lib/useRouter";

const OAUTH_TOKEN = "oauth";

export default function Authenticate(): JSX.Element {
  const { isInitialized, user } = useStytchUser();
  const stytch = useStytch();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (stytch && !user && isInitialized) {
      const token = searchParams.get("token");
      const stytchTokenType = searchParams.get("stytch_token_type");

      if (token && stytchTokenType === OAUTH_TOKEN) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        stytch.oauth.authenticate(token, {
          session_duration_minutes: 60,
        });
      }
    }
  }, [isInitialized, router, searchParams, stytch, user]);

  useEffect(() => {
    if (!isInitialized || !user) {
      return;
    }

    router.replace("/");
  }, [router, user, isInitialized]);

  return (
    <div className={styles.wrapper}>
      <Oval
        ariaLabel="oval-loading"
        color="#444"
        height="64"
        visible={true}
        width="64"
      />
    </div>
  );
}
