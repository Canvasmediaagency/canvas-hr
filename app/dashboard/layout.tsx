import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen relative bg-gray-50">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80 bg-white shadow-sm">
        <Sidebar />
      </div>
      <main className="md:pl-72 h-full overflow-auto">
        <div className="container mx-auto p-6 md:p-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
