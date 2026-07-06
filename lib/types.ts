export interface Fact { label: string; value: string }
export interface Status { state: "online" | "offline" | "busy"; label: string }
export interface LinkItem { label: string; value: string; href: string }
export interface Project { title: string; description: string; tags: string[]; href: string }
export interface JourneyStop { period: string; role: string; org: string; note: string }
export interface Like { label: string; text: string }
export interface Album { title: string; googlePhotosUrl: string; folder: string; }
export interface Spec { label: string; value: string }
export interface DeviceItem { name: string; tag?: string; image?: string; specs?: Spec[]; detail?: string; icon?: string }
export interface DeviceSection { categoryName: string; category: string; items: DeviceItem[] }
