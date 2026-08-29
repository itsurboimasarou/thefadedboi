export interface AccentVariant {
  accent: string;
  soft: string;
  contrast: string;
}

export interface AccentColorDef {
  key: string;
  label: string;
  dark: AccentVariant;
  light: AccentVariant;
}

export interface AccentSetDef {
  key: string;
  label: string;
  defaultKey: string;
  colors: AccentColorDef[];
}

const genshin: AccentColorDef[] = [
  {
    key: "anemo", label: "Anemo",
    dark: { accent: "#6fd6b4", soft: "#a8ecd6", contrast: "#06291f" },
    light: { accent: "#14966f", soft: "#6fd6b4", contrast: "#ffffff" },
  },
  {
    key: "geo", label: "Geo",
    dark: { accent: "#e8b74a", soft: "#f5d68f", contrast: "#3a2600" },
    light: { accent: "#b8790f", soft: "#e8b74a", contrast: "#ffffff" },
  },
  {
    key: "electro", label: "Electro",
    dark: { accent: "#b385e0", soft: "#d9c2f5", contrast: "#26123d" },
    light: { accent: "#7c3fc4", soft: "#b385e0", contrast: "#ffffff" },
  },
  {
    key: "dendro", label: "Dendro",
    dark: { accent: "#a8d64a", soft: "#d0ec97", contrast: "#1f2b06" },
    light: { accent: "#6f9a1f", soft: "#a8d64a", contrast: "#ffffff" },
  },
  {
    key: "hydro", label: "Hydro",
    dark: { accent: "#4cc3f0", soft: "#a3e4f7", contrast: "#052a3a" },
    light: { accent: "#1479c2", soft: "#4cc3f0", contrast: "#ffffff" },
  },
  {
    key: "pyro", label: "Pyro",
    dark: { accent: "#f0784a", soft: "#f7ac8c", contrast: "#3a1206" },
    light: { accent: "#cf5323", soft: "#f0784a", contrast: "#ffffff" },
  },
  {
    key: "cryo", label: "Cryo",
    dark: { accent: "#9be7ec", soft: "#d3f5f7", contrast: "#062b2d" },
    light: { accent: "#0e93ac", soft: "#4fd0e3", contrast: "#ffffff" },
  },
];

const wuwa: AccentColorDef[] = [
  {
    key: "fusion", label: "Fusion",
    dark: { accent: "#f08a9a", soft: "#f7bcc4", contrast: "#3a0812" },
    light: { accent: "#c81f45", soft: "#f08a9a", contrast: "#ffffff" },
  },
  {
    key: "glacio", label: "Glacio",
    dark: { accent: "#7fd8ea", soft: "#bdeef7", contrast: "#043038" },
    light: { accent: "#1791ad", soft: "#7fd8ea", contrast: "#ffffff" },
  },
  {
    key: "aero", label: "Aero",
    dark: { accent: "#7fe0c4", soft: "#bdf3e3", contrast: "#04291d" },
    light: { accent: "#159c78", soft: "#7fe0c4", contrast: "#ffffff" },
  },
  {
    key: "electro", label: "Electro",
    dark: { accent: "#c79bec", soft: "#e3cbf7", contrast: "#2a1240" },
    light: { accent: "#8536c9", soft: "#c79bec", contrast: "#ffffff" },
  },
  {
    key: "spectro", label: "Spectro",
    dark: { accent: "#e9c95a", soft: "#f5e2a0", contrast: "#3a2a02" },
    light: { accent: "#af8a12", soft: "#e9c95a", contrast: "#ffffff" },
  },
  {
    key: "havoc", label: "Havoc",
    dark: { accent: "#e888b4", soft: "#f5c0d8", contrast: "#3a0a20" },
    light: { accent: "#a8266e", soft: "#e888b4", contrast: "#ffffff" },
  },
];

const endfield: AccentColorDef[] = [
  {
    key: "heat", label: "Heat",
    dark: { accent: "#f2966a", soft: "#f8c2a5", contrast: "#3a1503" },
    light: { accent: "#cc5320", soft: "#f2966a", contrast: "#ffffff" },
  },
  {
    key: "electric", label: "Electric",
    dark: { accent: "#f0da5c", soft: "#f8eca0", contrast: "#3a3202" },
    light: { accent: "#b8960a", soft: "#f0da5c", contrast: "#ffffff" },
  },
  {
    key: "cryo", label: "Cryo",
    dark: { accent: "#82dce8", soft: "#bdf0f5", contrast: "#04262b" },
    light: { accent: "#178598", soft: "#82dce8", contrast: "#ffffff" },
  },
  {
    key: "nature", label: "Nature",
    dark: { accent: "#c3e06a", soft: "#e2f0ab", contrast: "#232f04" },
    light: { accent: "#7a9c1f", soft: "#c3e06a", contrast: "#ffffff" },
  },
  {
    key: "physical", label: "Physical",
    dark: { accent: "#c7cdd3", soft: "#e2e6ea", contrast: "#20262b" },
    light: { accent: "#5f6b74", soft: "#c7cdd3", contrast: "#ffffff" },
  },
];

export const accentSets: AccentSetDef[] = [
  { key: "genshin", label: "Genshin Impact", defaultKey: genshin[0].key, colors: genshin },
  { key: "wuwa", label: "Wuthering Waves", defaultKey: wuwa[0].key, colors: wuwa },
  { key: "endfield", label: "Arknights: Endfield", defaultKey: endfield[0].key, colors: endfield },
];

export const DEFAULT_SET = "genshin";
