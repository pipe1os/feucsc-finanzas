import Sidebar from "@/components/public/Sidebar";
import KPICards from "@/components/public/KPICards";
import ExpenseTrendChart from "@/components/public/ExpenseTrendChart";
import ExpenseTable from "@/components/public/ExpenseTable";
import ExpenseCategoryChart from "@/components/public/ExpenseCategoryChart";

export default function Home() {
  return (
    <div className="flex min-h-dvh bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 lg:ml-65">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-4 sm:px-6 lg:px-10 lg:pt-10 lg:pb-4">
          {/* Page header */}
          <header className="mb-8 animate-fade-in-up opacity-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1 w-8 rounded-full bg-red-500" />
              <span className="text-xs font-semibold tracking-widest text-red-500 uppercase">
                FEUCSC 2026
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Transparencia Financiera
            </h1>
            <p className="mt-2 text-sm text-gray-400 max-w-xl leading-relaxed">
              Presupuesto, gastos y comprobantes de la Federación de Estudiantes
              UCSC.
            </p>
          </header>

          {/* KPI Cards */}
          <section aria-label="Indicadores financieros" className="mb-8">
            <KPICards />
          </section>

          {/* Trend Chart */}
          <section aria-label="Tendencia de gastos" className="mb-8">
            <ExpenseTrendChart />
          </section>

          {/* Table + Donut Chart */}
          <section
            aria-label="Detalle de gastos"
            className="grid grid-cols-1 gap-6 xl:grid-cols-3"
          >
            <div className="xl:col-span-2">
              <ExpenseTable />
            </div>
            <div className="xl:col-span-1">
              <ExpenseCategoryChart />
            </div>
          </section>

          {/* Footer */}
          <footer
            className="mt-8 border-t border-gray-100 pt-6
                             animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-2">
              <p className="text-xs text-gray-400 text-center sm:text-left">
                © 2026 Federación de Estudiantes Universidad Católica de la
                Santísima Concepción.
              </p>
              <a
                href="https://instagram.com/feucsc_"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Instagram de FEUCSC"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
