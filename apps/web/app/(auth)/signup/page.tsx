import { Suspense } from 'react';
import { SignInForm } from '../signin/sign-in-form';

export const metadata = { title: 'הרשמה' };

export default function SignUpPage() {
  return (
    <Suspense>
      <SignInForm mode="signup" />
    </Suspense>
  );
}
