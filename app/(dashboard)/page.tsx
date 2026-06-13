import { redirect } from 'next/navigation'

// /  is handled by app/page.tsx which redirects to /dashboard
export default function DashboardRootRedirect() {
  redirect('/dashboard')
}
