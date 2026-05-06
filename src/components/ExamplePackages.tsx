"use client";

const POPULAR = ["next", "react", "lodash", "axios", "moment", "webpack", "express", "vite"];

interface Props {
  onPick: (name: string) => void;
  active?: string;
}

export function ExamplePackages({ onPick, active }: Props) {
  return (
    <div className="flex items-center flex-wrap gap-2 justify-center">
      <span className="text-[12.5px] text-[#71717a] mr-1">Popular:</span>
      {POPULAR.map((name) => {
        const isActive = active === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onPick(name)}
            className={
              "px-2.5 h-7 rounded-full text-[12.5px] border transition " +
              (isActive
                ? "bg-[#1c1a2b] border-[#a78bfa]/60 text-[#c4b5fd]"
                : "bg-[#111113] border-[#27272a] text-[#a1a1aa] hover:text-white hover:border-[#3f3f46]")
            }
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}
