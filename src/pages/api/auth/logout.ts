import type { NextApiRequest, NextApiResponse } from "next";
import { lucia } from "@/lib/auth";
import { validateRequest } from "@/lib/utils/api/auth/validate-request";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(404).end();
    return;
  }

  const { session } = await validateRequest(req, res);

  if (!session) {
    res.status(401).end();
    return;
  }

  await lucia.invalidateSession(session.id);

  res
    .setHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize())
    .status(200)
    .end();
};

export default handler;
