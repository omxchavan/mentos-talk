import { DashboardLayout } from '@/components';

export default function DashboardGroupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
