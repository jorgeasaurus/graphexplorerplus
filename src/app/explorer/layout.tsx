import { HeaderBar } from "./_components/header-bar";
import { Sidebar } from "./_components/sidebar";
import { StatusBar } from "./_components/status-bar";

export default function ExplorerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg-base">
      <HeaderBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-2">
          {children}
        </main>
      </div>
      <StatusBar />
    </div>
  );
}
