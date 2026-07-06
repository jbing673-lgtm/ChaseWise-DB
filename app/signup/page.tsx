import { AuthForm } from '@/components/AuthForm';

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-6">
      <AuthForm mode="signup" />
    </div>
  );
}