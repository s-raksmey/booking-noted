// hooks/use-session-status.ts
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function useSessionStatus() {
  const { data: session, status } = useSession();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(status === 'authenticated' && session?.user.role === 'SUPER_ADMIN');
  }, [status, session]);

  return { isLoggedIn, session, status };
}