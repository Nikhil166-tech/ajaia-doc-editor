"use client";

import React from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { FileText, Users } from "lucide-react";

export function Navbar() {
  const { currentUser, users, setCurrentUser } = useUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">Ajaia Docs</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Workspace MVP
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1.5 border border-slate-200">
            <div className="flex items-center gap-1.5 px-2 text-xs font-medium text-slate-500">
              <Users className="w-3.5 h-3.5" />
              <span>Simulated User:</span>
            </div>
            <select
              value={currentUser?.id || ""}
              onChange={(e) => {
                const selected = users.find((u) => u.id === e.target.value);
                if (selected) setCurrentUser(selected);
              }}
              className="text-xs font-semibold bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
