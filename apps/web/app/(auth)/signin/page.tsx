import { Suspense } from 'react';
import { SignInForm } from './sign-in-form';

export const metadata = { title: 'התחברות' };

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm mode="signin" />
    </Suspense>
  );
}
