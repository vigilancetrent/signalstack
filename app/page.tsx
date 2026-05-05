import Dashboard from "@/components/Dashboard";

export default function Page() {
  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <Dashboard />
      <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 px-2 text-[11px] text-cyber-dim font-mono">
        <span>
          signalstack v0.1 //{" "}
          <span className="text-cyber-cyan">quantflow</span> ecosystem
        </span>
        <span>
          synthetic feed · regime-switching gbm · sse · fluid compute
        </span>
      </footer>
    </main>
  );
}
