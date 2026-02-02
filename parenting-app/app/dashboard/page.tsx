import { ProgressDashboard } from '@/components/ProgressDashboard';
import Link from 'next/link';

export default function DashboardPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Panoul de Control</h1>

            <ProgressDashboard />

            <div className="mt-8">
                <Link href="/" className="text-blue-600 hover:underline">
                    &larr; Înapoi la Curs
                </Link>
            </div>
        </div>
    );
}
