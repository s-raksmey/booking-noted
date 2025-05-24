// app/super-admin/page.tsx
import { SuperAdminDashboard } from '@/components/superAdmin/super-admin-dashboard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-option';
import { redirect } from 'next/navigation';

export default async function SuperAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/super-admin');
  }

  if (session.user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard?error=unauthorized');
  }

  return <SuperAdminDashboard />;
}