import type { DeviceSection } from "./types";

export const devices: DeviceSection[] = [
  {
    categoryName: "Phones",
    category: "phone",
    items: [
      {
        name: "Xiaomi 17T",
        tag: "Main phone",
        image: "/phones/xiaomi17t.png",
        specs: [
          { label: "Display", value: '6.59" 1.5K AMOLED, 120Hz' },
          { label: "Chipset", value: "MediaTek Dimensity 8500 Ultra (4nm)" },
          { label: "Memory", value: "12GB LPDDR5X / 256GB UFS 4.1" },
          { label: "Camera", value: "50MP OV50E + 50MP JN5 (5x periscope) + 12MP ultrawide" },
          { label: "Battery", value: "6500mAh Si/C, 67W wired Xiaomi HyperCharge" },
          { label: "OS", value: "HyperOS 3 (Android 16)" },
        ],
      },
      {
        name: "Sharp AQUOS zero6",
        tag: "Sub phone",
        image: "/phones/sharp06.png",
        specs: [
          { label: "Display", value: '6.4" IGZO OLED, 240Hz' },
          { label: "Chipset", value: "Qualcomm Snapdragon 750G (8nm)" },
          { label: "Memory", value: "8GB LPDDR4X / 128GB UFS 2.1" },
          { label: "Camera", value: "48MP IMX586 + 8MP ultrawide + 8MP telephoto" },
          { label: "Battery", value: "4010mAh" },
          { label: "OS", value: "Android 13 - AQUOS UX" },
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
          { label: "Model", value: "21U4" },
          { label: "Display", value: "14.5-inch 2K+ (2560x1600) IPS 90Hz 100% sRGB 400nits" },
          { label: "CPU", value: "AMD Ryzen 7 H 255" },
          { label: "RAM", value: "24GB LPDDR5X 7500MHz" },
          { label: "Storage-1", value: "512GB YMTC YMSS2ED06D25MC NVMe PCIe 4.0" },
          { label: "Storage-2", value: "1TB Samsung SSD 980 NVMe PCIe 3.0" },
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
      { name: 'LG 27" 4K monitor', detail: "Primary display, calibrated", icon: "display" },
      { name: "Keychron K8 Pro", detail: "Gateron Brown switches", icon: "keyboard" },
      { name: "Logitech MX Master 3S", detail: "Daily driver mouse", icon: "mouse" },
      { name: "Sony WH-1000XM5", detail: "Focus headphones", icon: "headphones" },
    ],
  },
];
