export interface AccentDef {
  key: string;
  label: string;
  accent: string;
  soft: string;
  contrast: string;
}

export const accents: AccentDef[] = [
  { key: "anemo", label: "Anemo", accent: "#6fd6b4", soft: "#a8ecd6", contrast: "#06291f" },
  { key: "geo", label: "Geo", accent: "#e8b74a", soft: "#f5d68f", contrast: "#3a2600" },
  { key: "electro", label: "Electro", accent: "#b385e0", soft: "#d9c2f5", contrast: "#26123d" },
  { key: "dendro", label: "Dendro", accent: "#a8d64a", soft: "#d0ec97", contrast: "#1f2b06" },
  { key: "hydro", label: "Hydro", accent: "#4cc3f0", soft: "#a3e4f7", contrast: "#052a3a" },
  { key: "pyro", label: "Pyro", accent: "#f0784a", soft: "#f7ac8c", contrast: "#3a1206" },
  { key: "cryo", label: "Cryo", accent: "#9be7ec", soft: "#d3f5f7", contrast: "#062b2d" },
];
