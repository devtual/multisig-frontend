import Header from "@/components/Header";
import Startup from "@/components/Startup";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <Startup>
            <div className="min-h-screen bg-gray-900 text-white">
                <Header />
                <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </Startup>
    );
}
