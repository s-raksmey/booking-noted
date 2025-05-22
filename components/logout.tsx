// components/logout-button.tsx
'use client';

import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({
      redirect: false,
      callbackUrl: '/login'
    });
    router.push('/home');
    router.refresh();
  };

  return (
    <Button 
      variant="outline"
      onClick={handleLogout}
      className="ml-4"
    >
      Logout
    </Button>
  );
}