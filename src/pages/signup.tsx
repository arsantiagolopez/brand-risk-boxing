import { SignupForm } from "@/components/signup-form";

type SignupPageProps = {};

const SignupPage = ({}: SignupPageProps) => {
  return (
    <div className="p-20">
      <SignupForm />
    </div>
  );
};

export default SignupPage;
