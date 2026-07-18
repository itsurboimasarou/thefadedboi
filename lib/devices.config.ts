import type { DeviceSection } from "./types";

export const devices: DeviceSection[] = [
  {
    categoryName: "Phones",
    category: "phone",
    items: [
      {
        name: "Xiaomi 15 Pro (haotian)",
        tag: "Main phone",
        image: "/phones/xiaomi15pro.webp",
        specs: [
          { label: "Display", value: '6.73" 2K LTPO AMOLED (TCL CSOT M9), 120Hz' },
          { label: "Chipset", value: "Qualcomm Snapdragon 8 Elite (3nm)" },
          { label: "Memory", value: "12GB LPDDR5X / 256GB UFS 4.0" },
          { label: "Camera", value: "50MP OVX9000 + 50MP IMX858 (5x - 120mm) + 50MP JN1 (ultrawide)" },
          { label: "Battery", value: "6100mAh Si/C, 90W wired + 50W wireless" },
          { label: "OS", value: "HyperOS 3 (Android 16)" },
        ],
      },
      {
        name: "OPPO Reno4 Z 5G (CPH2065)",
        tag: "Sub phone",
        image: "/phones/opporeno4z.jpeg",
        specs: [
          { label: "Display", value: '6.57" FHD+ IPS LCD, 120Hz' },
          { label: "Chipset", value: "MediaTek Dimensity 800 (7nm)" },
          { label: "Memory", value: "12GB LPDDR4X / 256GB UFS 2.1" },
          { label: "Camera", value: "48MP IMX586 + 8MP (ultrawide) + 2MP (macro)" },
          { label: "Battery", value: "4000mAh, 18W wired" },
          { label: "OS", value: "Android 12 - ColorOS 12.1" },
        ],
      },
    ],
  },
  {
    categoryName: "Laptop & PC",
    category: "laptop",
    items: [
      {
        name: "Lenovo ThinkBook 14 G7+ AHP",
        tag: "Daily driver",
        image: "/phones/LenovoThinkBook14AHP.jpg",
        specs: [
          { label: "Model", value: "21U40001CD" },
          { label: "Display", value: '14.5" 2K+ (2560×1600) IPS 90Hz, 100% sRGB, 400nits' },
          { label: "CPU", value: "AMD Ryzen 7 H 255 (Zen 4)" },
          { label: "Graphics", value: "AMD Radeon 780M (integrated)" },
          { label: "RAM", value: "24GB LPDDR5X 7500MHz" },
          { label: "Storage-1", value: "512GB YMTC YMSS2ED06D25MC NVMe PCIe 4.0" },
          { label: "Storage-2", value: "1TB Samsung 980 NVMe PCIe 3.0" },
          { label: "OS", value: "Fedora Linux (KDE Plasma) 44" },
        ],
      },
      {
        name: "Mac mini M4 Pro",
        tag: "Mini PC",
        image: "/phones/applem4.jpg",
        specs: [
          { label: "CPU", value: "Apple M4 Pro (12-cores CPU + 16-cores GPU)" },
          { label: "Memory", value: "48GB LPDDR5X unified memory / 1TB NVMe SSD" },
          { label: "OS", value: "macOS Golden Gate (27) Developer Beta" },
        ],
      },
    ],
  },
  {
    categoryName: "Gears",
    category: "gear",
    items: [
      { name: 'Acer Predator XB273U V3', detail: "Primary 2K display for gaming", icon: "display" },
      { name: "Lofree Flow Lite", detail: "Lightweight low-profile keyboard", icon: "keyboard" },
      { name: "ATK Dragonfly A9", detail: "Daily driver mouse", icon: "mouse" },
      { name: "Tangzu Wan'er SG 2", detail: "Focus IEM", icon: "headphones" },
      { name: "Maono DGM20", detail: "Microphone", icon: "microphone" },
    ],
  },
];
