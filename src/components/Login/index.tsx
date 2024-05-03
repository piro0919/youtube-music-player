"use client";
import { StytchLogin, useStytchUser } from "@stytch/nextjs";
import { OAuthProviders, Products } from "@stytch/vanilla-js";
import { ComponentProps, useEffect } from "react";
import { useBoolean, useInterval } from "usehooks-ts";
import styles from "./style.module.scss";
import getDomainFromWindow from "@/lib/getDomainFromWindow";
import useRouter from "@/lib/useRouter";

export default function Login(): JSX.Element {
  const redirectUrl = `${getDomainFromWindow()}/authenticate`;
  const config: ComponentProps<typeof StytchLogin>["config"] = {
    oauthOptions: {
      loginRedirectURL: redirectUrl,
      providers: [{ type: OAuthProviders.Google }],
      signupRedirectURL: redirectUrl,
    },
    products: [Products.oauth],
  };
  const stytchLoginStyles: ComponentProps<typeof StytchLogin>["styles"] = {
    container: {
      width: "300px",
    },
    hideHeaderText: true,
  };
  const { setTrue, value } = useBoolean(false);
  const { isInitialized, user } = useStytchUser();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && user) {
      router.replace("/");

      return;
    }
  }, [isInitialized, router, user]);

  useInterval(
    () => {
      const oauthGoogle = document.getElementById("oauth-google");

      if (!oauthGoogle) {
        return;
      }

      const span = oauthGoogle.getElementsByTagName("span");

      span[0].innerHTML = "Google でログイン";

      setTrue();
    },
    value ? null : 250,
  );

  return (
    <div className={styles.wrapper} style={{ opacity: value ? 1 : 0 }}>
      <StytchLogin config={config} styles={stytchLoginStyles} />
    </div>
  );
}
