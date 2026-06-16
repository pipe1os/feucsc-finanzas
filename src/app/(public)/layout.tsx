import Sidebar from "@/components/public/Sidebar";

/**
 * Public layout that wraps the public-facing pages with the Sidebar component.
 * Applies the correct margin spacing for desktop/mobile views natively.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children The nested routes.
 */
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
