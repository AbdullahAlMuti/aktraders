import { LoginForm } from "@/features/authentication/LoginForm";

export const metadata = {
  title: "Admin Login",
  description: "Secure login portal for AK Traders Employee Database System",
};

export default function LoginPage() {
  return <LoginForm />;
}
