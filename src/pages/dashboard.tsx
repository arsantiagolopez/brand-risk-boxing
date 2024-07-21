import { Button } from "@/components/ui/button";
import { validateRequest } from "@/lib/utils/api/auth/validate-request";
import { User } from "lucia";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { useRouter } from "next/router";
import { type FormEvent } from "react";

type DashboardPageProps = {
  user: User;
};

const DashboardPage = ({ user }: DashboardPageProps) => {
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    router.push("/login");
  };

  return (
    <div>
      Hi, {user.email}!
      <form onSubmit={handleSubmit}>
        <Button>Log out</Button>
      </form>
    </div>
  );
};

export default DashboardPage;

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<DashboardPageProps>> {
  const { user } = await validateRequest(context.req, context.res);

  if (!user) {
    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
    };
  }

  return {
    props: {
      user,
    },
  };
}
