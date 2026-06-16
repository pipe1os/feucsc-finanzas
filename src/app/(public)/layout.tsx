import Sidebar from "@/components/public/Sidebar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <main className="flex-1 min-w-0 lg:ml-65">
        {children}
      </main>
    </>
  );
}
