"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { ExamplePackages } from "@/components/ExamplePackages";

export default function Home() {
  const [pkg, setPkg] = useState<string>("");

  return (
    <main className="min-h-dvh flex flex-col">
      <Header />

      <section className="px-4 sm:px-6 pt-14 pb-10 sm:pt-20 sm:pb-14">
        <div className="mx-auto max-w-3xl flex flex-col items-center text-center gap-6">
          <h1 className="text-[28px] sm:text-[40px] leading-[1.1] font-semibold tracking-tight text-[#fafafa]">
            Visualize any npm package&rsquo;s
            <br className="hidden sm:block" /> full dependency tree.
          </h1>
          <p className="text-[15px] sm:text-[16px] text-[#71717a] max-w-xl">
            Type a package, see every dep it pulls in, sized by bundle weight.
            Understand exactly why your <code className="text-[#a78bfa]">node_modules</code> is so large.
          </p>

          <div className="w-full flex justify-center mt-2">
            <SearchBar initialValue={pkg} onSubmit={setPkg} />
          </div>

          <ExamplePackages onPick={setPkg} active={pkg} />
        </div>
      </section>

      <section className="flex-1 px-4 sm:px-6 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-[#18181b] graph-bg h-[480px] sm:h-[640px] grid place-items-center text-[#52525b] text-sm">
            {pkg ? `→ ${pkg} (graph coming next milestone)` : "graph will render here"}
          </div>
        </div>
      </section>
    </main>
  );
}
