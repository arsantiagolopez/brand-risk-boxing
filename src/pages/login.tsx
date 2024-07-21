import { LoginForm } from "@/components/login-form";

type LoginPageProps = {};

const LoginPage = ({}: LoginPageProps) => {
  return (
    <div className="p-20">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
