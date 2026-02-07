'use client';

import Sidebar from './Sidebar';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen flex bg-background">
            <Sidebar />
            <main className="flex-1 lg:ml-0 overflow-auto">
                <div className="container mx-auto p-6 lg:p-8 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
