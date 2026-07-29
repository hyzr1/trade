// lib/portfolio-meta.ts
export type PortfolioMeta = {
  party?: "D" | "R" | "I";
  chamber?: "House" | "Senate";
  district?: string;
  termCount?: number;
  role?: string;
  estAUM?: string;
  house?: string;
  modelId?: string;
};

export const META: Record<string, PortfolioMeta> = {
  pelosi: {
    party: "D", chamber: "House", district: "CA-11", termCount: 19,
    role: "Speaker Emerita", estAUM: "≈$112M",
  },
  greene: {
    party: "R", chamber: "House", district: "GA-14", termCount: 3,
    role: "Representative", estAUM: "≈$2.6M",
  },
  gottheimer: {
    party: "D", chamber: "House", district: "NJ-5", termCount: 5,
    role: "Representative", estAUM: "≈$8.4M",
  },
  hern: {
    party: "R", chamber: "House", district: "OK-1", termCount: 4,
    role: "Chair, RSC", estAUM: "≈$56M",
  },
  gpt: { house: "OpenAI", modelId: "gpt-5" },
  claude: { house: "Anthropic", modelId: "claude-opus-4-7" },
};

export function metaFor(slug: string): PortfolioMeta {
  return META[slug] ?? {};
}
