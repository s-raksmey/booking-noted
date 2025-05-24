// app/(protected)/staff/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-option';
import { redirect } from 'next/navigation';
import { StaffDashboard } from '@/components/staff/staff-dashboard';

export default async function StaffPage() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      redirect('/login?callbackUrl=/staff');
    }

    if (session.user.role !== 'STAFF') {
      redirect('/unauthorized');
    }

    return <StaffDashboard/>
  } catch (error) {
    console.error('Error in StaffPage:', error);
    redirect('/error?message=Failed to load staff dashboard');
  }
}