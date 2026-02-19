"use client";

import { useRef, useEffect, useState } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: Props) {
  const [local, setLocal] = useState(value);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = (val: string) => {
    setLocal(val);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      onChange(val);
    }, 300);
  };

  return (
    <input
      type="text"
      placeholder="Search congresses by name, city, or tags…"
      value={local}
      onChange={(e) => handleChange(e.target.value)}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
    />
  );
}
