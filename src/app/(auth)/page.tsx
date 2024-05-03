import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import App from "@/components/App";
import loadStytch from "@/lib/loadStytch";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function Page({
  searchParams: { list: searchParamList, v: searchParamV },
}: PageProps): Promise<JSX.Element> {
  const cookieStore = cookies();
  const sessionJWT = cookieStore.get("stytch_session_jwt");

  if (!sessionJWT) {
    redirect("/login");
  }

  const stytchClient = loadStytch();
  const {
    session: { user_id: userId },
  } = await stytchClient.sessions.authenticateJwt({
    session_jwt: sessionJWT.value,
  });
  const musicListList = await prisma.musicList.findMany({
    select: {
      id: true,
      title: true,
    },
    where: {
      userId,
    },
  });
  const [{ id: musicListId }] = musicListList;
  const list =
    typeof searchParamList === "string" ? searchParamList : musicListId;
  const musicList = await prisma.musicList.findUniqueOrThrow({
    select: {
      musics: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    where: {
      id: list,
    },
  });
  const { musics } = musicList;
  const [{ id: musicId }] = musics;
  const v = typeof searchParamV === "string" ? searchParamV : musicId;

  return (
    <App list={list} musicListList={musicListList} musics={musics} v={v} />
  );
}
