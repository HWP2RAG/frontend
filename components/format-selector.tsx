"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FORMATS = [
  { value: "markdown", label: "Markdown" },
  { value: "json", label: "JSON" },
  { value: "plaintext", label: "Plain Text" },
  { value: "rag-json", label: "RAG-JSON" },
  { value: "csv", label: "CSV" },
  { value: "html", label: "HTML" },
] as const;

interface FormatSelectorProps {
  value: string;
  onChange: (format: string) => void;
}

export function FormatSelector({ value, onChange }: FormatSelectorProps) {
  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList className="overflow-x-auto">
        {FORMATS.map((f) => (
          <TabsTrigger key={f.value} value={f.value}>
            {f.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
