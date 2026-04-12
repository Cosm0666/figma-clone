import { Liveblocks } from "@liveblocks/node";
import { env } from "~/env";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

const liveblocks = new Liveblocks({ secret: env.LIVEBLOCKS_SECRET_KEY });

export async function POST(req: Request) {
  const userSession = await auth();

  const user = await db.user.findUnique({
    where: {
      id: userSession?.user.id,
    },
  });

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  const session = liveblocks.prepareSession(user.id, {
    userInfo: {
      name: user.email ?? "Anonymous",
    },
  });

  session.allow(`room:${"test"}`, session.FULL_ACCESS);

  const { status, body } = await session.authorize();

  return new Response(body, { status });
}
