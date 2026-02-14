import type { ReactElement } from "react";
import { Link } from "react-router";

export default function LandingPage(): ReactElement {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black text-slate-900 dark:text-slate-50 relative overflow-hidden selection:bg-slate-300 dark:selection:bg-slate-700 selection:text-black dark:selection:text-white font-sans">
      {/* Subtle Monochrome Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-200/50 dark:bg-slate-800/20 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl animate-fade-in">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-none shadow-sm mb-10">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-slate-400 opacity-75"></span>
            <span className="relative inline-flex rounded-none h-2.5 w-2.5 bg-slate-900 dark:bg-slate-100"></span>
          </span>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300 tracking-wide">
            Building in Progress
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="flex flex-col gap-3 mb-8">
          <span className="text-4xl sm:text-5xl font-medium text-slate-500 dark:text-slate-400 tracking-tight">
            Sit tight.
          </span>
          <span className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white tracking-tight">
            We're building your app.
          </span>
        </h1>

        {/* Clean Progress Bar */}
        <div className="w-64 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden mb-10 border border-slate-200 dark:border-slate-800">
          <div
            className="h-full bg-slate-900 dark:bg-slate-100 rounded-full w-1/3 animate-[loading_2s_ease-in-out_infinite]"
            style={{ marginLeft: "-100%", width: "50%" }}
          ></div>
          <style>{`
            @keyframes loading {
              0% { transform: translateX(0); }
              50% { transform: translateX(400%); }
              100% { transform: translateX(400%); }
            }
          `}</style>
        </div>

        {/* Description */}
        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-10 max-w-lg mx-auto">
          In the meanwhile, you can explore a demo application that{" "}
          <strong className="font-semibold text-slate-900 dark:text-white">
            Customware AI
          </strong>{" "}
          has built.
        </p>

        {/* CTA Button */}
        <Link
          to="/dashboard"
          className="group inline-flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black text-lg font-medium rounded-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-500/10 active:scale-[0.98]"
        >
          Explore Demo
          <svg
            className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-8 text-center">
        <p className="text-sm text-slate-400 dark:text-slate-600 font-medium">
          &copy; {new Date().getFullYear()} Customware AI
        </p>
      </footer>
    </div>
  );
}
