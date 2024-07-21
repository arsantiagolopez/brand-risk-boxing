import type { Session, User } from "lucia";
import type { IncomingMessage, ServerResponse } from "http";
import { lucia } from "@/lib/auth";

type ValidateRequestResponse =
  | {
      user: User;
      session: Session;
    }
  | {
      user: null;
      session: null;
    };

export const validateRequest = async (
  req: IncomingMessage,
  res: ServerResponse
): Promise<ValidateRequestResponse> => {
  const sessionId = lucia.readSessionCookie(req.headers.cookie || "");

  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }

  const result = await lucia.validateSession(sessionId);

  if (result.session && result.session.fresh) {
    res.appendHeader(
      "Set-Cookie",
      lucia.createSessionCookie(result.session.id).serialize()
    );
  }

  if (!result.session) {
    res.appendHeader(
      "Set-Cookie",
      lucia.createBlankSessionCookie().serialize()
    );
  }

  return result;
};
