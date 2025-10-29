import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen relative">
      <div className="hidden h-full md:flex md:w-40 md:flex-col md:fixed md:inset-y-0 z-80 shadow-xl">
        <Sidebar />
      </div>
      <main className="md:pl-40 h-full overflow-auto bg-gray-50">
        <div className="container mx-auto p-6 md:p-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
