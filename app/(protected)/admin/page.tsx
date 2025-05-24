// app/(protected)/admin/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-option';
import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/admin-dashboard';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  return <AdminDashboard />;
}