"use client";

import { useEffect, useRef, useState } from "react";

interface SearchBarProps {
  initialValue?: string;
  onSubmit: (name: string) => void;
  loading?: boolean;
}

export function SearchBar({ initialValue = "", onSubmit, loading }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    onSubmit(v);
    inputRef.current?.blur();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl flex items-stretch gap-2"
    >
      <div className="relative flex-1">
        <span
          aria-hidden
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52525b]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder='package name (e.g. "next", "lodash")'
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="w-full h-12 pl-10 pr-4 rounded-lg bg-[#111113] border border-[#27272a] focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20 outline-none text-[15px] text-[#fafafa] placeholder:text-[#52525b] transition"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="h-12 px-5 rounded-lg bg-[#a78bfa] text-[#09090b] font-semibold text-[14px] flex items-center gap-1.5 hover:bg-[#c4b5fd] disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-[#09090b]/30 border-t-[#09090b] rounded-full spin-slow" />
        ) : (
          <>
            <span>Spy</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
