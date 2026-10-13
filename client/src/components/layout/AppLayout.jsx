import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0e12] text-slate-200">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <footer className="border-t border-[#1b202c] py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CollabSphere — Workspace for Developers & Engineering Teams</span>
          <span className="font-mono text-[11px] text-slate-600">Built with Node.js, Express, React, Vite, Tailwind & Gemini AI</span>
        </div>
      </footer>
    </div>
  );
};
