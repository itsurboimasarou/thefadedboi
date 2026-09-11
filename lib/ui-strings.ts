import type { Localized } from "./i18n";

/* components/controls/ThemeToggle.tsx */
export const themeUi: Localized<{ toggle: string; auto: string; autoOn: string }> = {
  en: {
    toggle: "Toggle theme",
    auto: "Match browser theme",
    autoOn: "Matching browser theme",
  },
  vi: {
    toggle: "Đổi giao diện",
    auto: "Theo giao diện trình duyệt",
    autoOn: "Đang theo giao diện trình duyệt",
  },
};

/* components/controls/GlassMode.tsx */
export const glassUi: Localized<{
  glass: string;
  off: string;
  hubar: string;
  all: string;
  tint: string;
}> = {
  en: {
    glass: "Glass blur",
    off: "Off",
    hubar: "Bar only",
    all: "All elements",
    tint: "Tint",
  },
  vi: {
    glass: "Hiệu ứng kính mờ",
    off: "Tắt",
    hubar: "Chỉ thanh",
    all: "Mọi thành phần",
    tint: "Độ đậm",
  },
};

/* components/controls/HuBarDock.tsx */
export const dockUi: Localized<{
  position: string;
  top: string;
  bottom: string;
  left: string;
  right: string;
}> = {
  en: {
    position: "HuBar position",
    top: "Top",
    bottom: "Bottom",
    left: "Left",
    right: "Right",
  },
  vi: {
    position: "Vị trí HuBar",
    top: "Trên",
    bottom: "Dưới",
    left: "Trái",
    right: "Phải",
  },
};

/* components/controls/HuBarShape.tsx */
export const shapeUi: Localized<{ shape: string; rounded: string; pill: string }> = {
  en: { shape: "HuBar shape", rounded: "Rounded corners", pill: "Pill" },
  vi: { shape: "Kiểu viền HuBar", rounded: "Bo góc", pill: "Bo tròn" },
};

/* components/controls/LogoSwitch.tsx */
export const logoUi: Localized<{ logo: string; default: string; noLogos: string }> = {
  en: { logo: "Logo", default: "Default", noLogos: "No logo presented." },
  vi: { logo: "Logo", default: "Mặc định", noLogos: "Chưa có logo nào." },
};

/* components/controls/StarMode.tsx */
export const starsUi: Localized<{
  stars: string;
  aboutStars: string;
  starsTip: string;
  lockedByLite: string;
  rate: string;
  rates: [string, string, string, string];
}> = {
  en: {
    stars: "Shooting stars",
    aboutStars: "About shooting stars",
    starsTip: "Showers of streaks from the top corners of the background. Off by default. Frequency sets how often they come, from Rare to Meteor shower — the busier the sky, the more of the time the GPU spends redrawing, so Meteor shower costs the most. A star only exists while it is flying, and nothing runs while the tab is in the background or while the home page is showing its video or photo. Off in Lite mode and when your system prefers reduced motion.",
    lockedByLite: "Disabled by Lite mode",
    rate: "Star frequency",
    rates: ["Rare", "Occasional", "Frequent", "Meteor shower"],
  },
  vi: {
    stars: "Sao băng",
    aboutStars: "Về sao băng",
    starsTip: "Những đợt sao băng lướt xuống từ các góc trên của nền. Mặc định tắt. Tần suất chỉnh độ dày của sao, từ Hiếm đến Mưa sao băng — trời càng nhiều sao thì GPU càng phải vẽ lại nhiều, nên Mưa sao băng tốn nhất. Mỗi ngôi sao chỉ tồn tại khi đang bay, và không có gì chạy khi thẻ đang ở nền hoặc khi trang chủ đang hiển thị video hay ảnh nền. Tắt trong Chế độ nhẹ và khi hệ thống của bạn ưu tiên giảm chuyển động.",
    lockedByLite: "Bị tắt bởi Chế độ Lite",
    rate: "Tần suất sao băng",
    rates: ["Hiếm", "Thỉnh thoảng", "Thường xuyên", "Mưa sao băng"],
  },
};

/* components/controls/AccentBackground.tsx */
export const accentBgUi: Localized<{
  background: string;
  aboutBackground: string;
  backgroundTip: string;
  mix: string;
  white: string;
  theme: string;
  average: string;
  black: string;
  motion: string;
  aboutMotion: string;
  motionTip: string;
  tone: string;
  drifting: string;
  style: string;
  styleNone: string;
  styleLinear: string;
  styleHuLight: string;
  direction: string;
  toBottomRight: string;
  toBottomLeft: string;
  angle: string;
  speed: string;
  grain: string;
}> = {
  en: {
    background: "Accent background",
    aboutBackground: "About accent background",
    backgroundTip: "A wash of your accent colour behind each page. HuLight pools it in the corners; Linear runs it across as one ramp; None keeps one flat colour — still tinted by your accent, just faintly enough to leave text contrast alone. Used while Backdrop is set to Colour / Gradient, and on every page but home while it is set to Media.",
    mix: "Background tone",
    white: "Pastel",
    theme: "Follow theme",
    average: "Average",
    black: "Deep",
    motion: "Drifting background",
    aboutMotion: "About drifting background",
    motionTip: "Slowly moves the HuLight pools. Linear has no drift. Off in Lite mode and when your system prefers reduced motion.",
    tone: "Tone",
    drifting: "Drifting",
    style: "Gradient style",
    styleNone: "None (plain colour)",
    styleLinear: "Linear",
    styleHuLight: "HuLight (corners)",
    direction: "Direction",
    toBottomRight: "To bottom right",
    toBottomLeft: "To bottom left",
    angle: "Angle",
    speed: "Speed",
    grain: "Grain",
  },
  vi: {
    background: "Nền màu nhấn",
    aboutBackground: "Về nền màu nhấn",
    backgroundTip: "Lớp màu nhấn phía sau mỗi trang. HuLight loang ở các góc; Linear trải thành một dải; Không giữ một màu phẳng — vẫn pha nhẹ màu nhấn, đủ nhạt để không ảnh hưởng độ tương phản chữ. Được dùng khi Kiểu nền đặt thành Màu / Chuyển sắc, và ở mọi trang trừ trang chủ khi đặt thành Media.",
    mix: "Tông nền",
    white: "Pastel",
    theme: "Theo giao diện",
    average: "Trung bình",
    black: "Đậm",
    motion: "Nền chuyển động",
    aboutMotion: "Về nền chuyển động",
    motionTip: "Cho các vệt HuLight trôi chậm. Linear không có chuyển động. Tắt ở chế độ Lite và khi hệ thống yêu cầu giảm chuyển động.",
    tone: "Tông",
    drifting: "Chuyển động",
    style: "Kiểu chuyển sắc",
    styleNone: "Không (màu trơn)",
    styleLinear: "Tuyến tính",
    styleHuLight: "HuLight (góc)",
    direction: "Hướng",
    toBottomRight: "Xuống góc phải",
    toBottomLeft: "Xuống góc trái",
    angle: "Góc nghiêng",
    speed: "Tốc độ",
    grain: "Độ nhiễu hạt",
  },
};

/* components/controls/ImportantNotice.tsx */
export const noticeUi: Localized<{
  title: string;
  motionHeading: string;
  motionBody: string;
  keepDefault: string;
  useLite: string;
  blockerHeading: string;
  blockerBody: string;
  videoHeading: string;
  videoBody: string;
  once: string;
}> = {
  en: {
    title: "Important notice",
    motionHeading: "Motion & effects",
    motionBody:
      "This site uses background animations and blurs. On an older browser or a weaker device you can turn them off, and change it again any time from the switch in the \u201CAt a glance\u201D panel.",
    keepDefault: "Keep default",
    useLite: "Switch to Lite mode",
    blockerHeading: "Ad blockers",
    blockerBody:
      "If you use an ad blocker, allowing this site is recommended. Nothing here is an ad and nothing is tracked, but blockers might stop photo downloads and the home backdrop from loading properly.",
    videoHeading: "Videos on Linux",
    videoBody:
      "Videos on this site are encoded in H.265 (HEVC). On Linux, Chrome and other Chromium-based browsers can only play it through hardware decoding, so without a VA-API driver that supports HEVC the videos and their thumbnails show up black. Install a VA-API driver with HEVC support for your graphics card and turn on hardware video decoding in your browser. Firefox can usually play them through the system FFmpeg.",
    once: "This is a one time message, and your choice can be changed later.",
  },
  vi: {
    title: "Lưu ý quan trọng",
    motionHeading: "Chuyển động & hiệu ứng",
    motionBody:
      "Trang này dùng hiệu ứng chuyển động và làm mờ ở nền. Nếu bạn dùng trình duyệt cũ hoặc máy yếu, bạn có thể tắt chúng, và đổi lại bất cứ lúc nào bằng công tắc trong bảng \u201CTổng quan\u201D.",
    keepDefault: "Giữ mặc định",
    useLite: "Chuyển sang chế độ Lite",
    blockerHeading: "Trình chặn quảng cáo",
    blockerBody:
      "Nếu bạn dùng trình chặn quảng cáo, nên cho phép trang này. Ở đây không có quảng cáo và không thu thập dữ liệu, nhưng các trình chặn có thể vô tình làm hỏng việc tải ảnh xuống và ảnh/video nền ở trang chủ.",
    videoHeading: "Video trên Linux",
    videoBody:
      "Video trên trang này được mã hoá bằng H.265 (HEVC). Trên Linux, Chrome và các trình duyệt nhân Chromium chỉ phát được định dạng này qua giải mã phần cứng, nên nếu thiếu driver VA-API hỗ trợ HEVC thì video và ảnh thu nhỏ sẽ bị đen. Hãy cài driver VA-API có hỗ trợ HEVC cho card đồ hoạ của bạn và bật giải mã video bằng phần cứng trong trình duyệt. Firefox thường vẫn phát được nhờ FFmpeg của hệ thống.",
    once: "Đây là thông báo một lần, và bạn có thể thay đổi lựa chọn sau đó.",
  },
};

/* ── Layout ────────────────────────────────────── */

/* components/layout/ControlPanel.tsx */
/* components/controls/BarMode.tsx */
export const barModeUi: Localized<{
  bars: string;
  position: string;
  shape: string;
  hubar: string;
  split: string;
  aboutBars: string;
  barsTip: string;
}> = {
  en: {
    bars: "Bars",
    position: "Nav pill position",
    shape: "Nav pill style",
    hubar: "HuBar (one bar)",
    split: "Top bar + nav pill",
    aboutBars: "About bars",
    barsTip: "HuBar keeps navigation and the status group on one bar. Top bar + nav pill splits them: a header with the logo, music, clock and language, and a floating pill for navigation on its own. Position and shape still apply to the pill — minus Top, which the header takes.",
  },
  vi: {
    bars: "Thanh",
    position: "Vị trí pill điều hướng",
    shape: "Kiểu pill điều hướng",
    hubar: "HuBar (một thanh)",
    split: "Thanh trên + pill điều hướng",
    aboutBars: "Về thanh",
    barsTip: "HuBar giữ điều hướng và nhóm trạng thái trên cùng một thanh. Thanh trên + pill tách chúng ra: một thanh tiêu đề với logo, nhạc, đồng hồ và ngôn ngữ, cùng một pill nổi chỉ để điều hướng. Vị trí và kiểu dáng vẫn áp dụng cho pill — trừ Trên cùng, vốn thuộc về thanh tiêu đề.",
  },
};

export const controlPanelUi: Localized<{
  atAGlance: string;
  back: string;
  changelog: string;
  resetAll: string;
  close: string;
  appearance: string;
  aboutAppearance: string;
  appearanceTip: string;
  glassBlur: string;
  aboutGlass: string;
  glassTip: string;
  liteMode: string;
  aboutLite: string;
  liteTip: string;
  autoHide: string;
  aboutAutoHide: string;
  autoHideTip: string;
  huBarPosition: string;
  huBarShape: string;
  gradientBg: string;
  backdrop: string;
  aboutBackdrop: string;
  backdropTip: string;
  backdropNone: string;
  backdropGradient: string;
  backdropMedia: string;
  gradientOffNote: string;
  language: string;
  customizeTheme: string;
  colorSets: string;
  accentColor: string;
  logo: string;
  swipeForMusic: string;
  siteControls: string;
  musicPlayer: string;
  activePanel: string;
}> = {
  en: {
    atAGlance: "At a glance",
    back: "Back",
    changelog: "Changelog",
    resetAll: "Reset all to default",
    close: "Close",
    appearance: "Appearance",
    aboutAppearance: "About appearance",
    appearanceTip: "Switch between dark and light. The auto button follows your browser's theme setting instead, and changes along with it. Use the dark/light switch will turn auto theme off.",
    glassBlur: "Glass blur",
    aboutGlass: "About glass effect",
    glassTip: "Frosted blur behind HuBar or every elements. Costs GPU when anything animates behind it. The Tint slider below sets how much colour those surfaces carry.",
    liteMode: "Lite mode",
    aboutLite: "About Lite mode",
    liteTip: "Turns off animations and transparency effects — recommended for older devices or weak hardware.",
    autoHide: "Auto-hide",
    aboutAutoHide: "About auto-hide",
    autoHideTip: "HuBar hides itself after a moment and reappears on hover, edge-swipe, or focus. Turn this off to keep it always shown.",
    huBarPosition: "HuBar position",
    huBarShape: "HuBar shape",
    gradientBg: "Gradient background",
    backdrop: "Backdrop",
    aboutBackdrop: "About the backdrop",
    backdropTip: "What sits behind every page. None is the flat theme colour — plain black or white, with no accent tint. Colour/Gradient hands the ground to your gradient background settings. Media plays the backdrop video or photo on the home page, with a button there to switch between the two, and uses your gradient background settings on every other page.",
    backdropNone: "None",
    backdropGradient: "Colour / Gradient",
    backdropMedia: "Media (Home only)",
    gradientOffNote: "Set Backdrop to Colour / Gradient or Media to use these.",
    language: "Language",
    customizeTheme: "Customize theme",
    colorSets: "Color sets",
    accentColor: "Accent color",
    logo: "Logo",
    swipeForMusic: "Swipe right for music player",
    siteControls: "Site controls",
    musicPlayer: "Music player",
    activePanel: "Active panel",
  },
  vi: {
    atAGlance: "Tổng quan",
    back: "Quay lại",
    changelog: "Nhật ký cập nhật",
    resetAll: "Đặt lại về mặc định",
    close: "Đóng",
    appearance: "Giao diện",
    aboutAppearance: "Về giao diện",
    appearanceTip: "Chuyển giữa giao diện tối và sáng. Nút tự động sẽ theo cài đặt giao diện của trình duyệt và tự đổi theo, dùng công tắc sáng/tối sẽ tắt tự động chuyển giao diện theo trình duyệt",
    glassBlur: "Hiệu ứng kính mờ",
    aboutGlass: "Về hiệu ứng kính mờ",
    glassTip: "Hiệu ứng mờ sương phía sau HuBar hoặc mọi thành phần. Tiêu tốn GPU khi có chuyển động phía sau. Thanh Độ đậm bên dưới chỉnh lượng màu của các bề mặt đó.",
    liteMode: "Chế độ Lite",
    aboutLite: "Về chế độ Lite",
    liteTip: "Tắt hiệu ứng chuyển động và độ trong suốt — khuyên dùng cho máy cũ hoặc cấu hình yếu.",
    autoHide: "Tự động ẩn",
    aboutAutoHide: "Về tính năng tự động ẩn",
    autoHideTip: "HuBar sẽ tự động ẩn sau một lúc và hiện lại khi di chuột tới, vuốt cạnh màn hình, hoặc focus vào. Tắt để luôn hiển thị.",
    huBarPosition: "Vị trí HuBar",
    huBarShape: "Kiểu HuBar",
    gradientBg: "Nền chuyển sắc",
    backdrop: "Kiểu nền",
    aboutBackdrop: "Về kiểu nền",
    backdropTip: "Thứ hiển thị phía sau mọi trang. Tắt giữ màu nền mặc định — đen hoặc trắng, không pha màu nhấn. Màu/Chuyển sắc dùng theo cài đặt nền chuyển sắc. Media phát video hoặc ảnh nền ở trang chủ, có nút ngay tại đó để chuyển giữa hai loại, các trang còn lại dùng cài đặt nền chuyển sắc của bạn.",
    backdropNone: "Tắt",
    backdropGradient: "Màu / Chuyển sắc",
    backdropMedia: "Media (chỉ Trang chủ)",
    gradientOffNote: "Đặt Kiểu nền thành Màu / Chuyển sắc hoặc Media để dùng phần này.",
    language: "Ngôn ngữ",
    customizeTheme: "Tùy chỉnh giao diện",
    colorSets: "Bộ màu",
    accentColor: "Màu sắc",
    logo: "Biểu tượng",
    swipeForMusic: "Vuốt sang phải để mở trình phát nhạc",
    siteControls: "Điều khiển trang",
    musicPlayer: "Trình phát nhạc",
    activePanel: "Bảng đang mở",
  },
};

/* components/layout/HuBarTrigger.tsx */
export const hubarTriggerUi: Localized<{ open: string; close: string }> = {
  en: { open: "At a glance", close: "Close controls" },
  vi: { open: "Tổng quan", close: "Đóng bảng điều khiển" },
};

/* components/layout/VideoBackground.tsx */
export const backdropToolsUi: Localized<{ pause: string; play: string; toPhoto: string; toVideo: string }> = {
  en: {
    pause: "Pause background video",
    play: "Play background video",
    toPhoto: "Switch backdrop to photo",
    toVideo: "Switch backdrop to video",
  },
  vi: {
    pause: "Tạm dừng video nền",
    play: "Phát video nền",
    toPhoto: "Đổi nền sang ảnh",
    toVideo: "Đổi nền sang video",
  },
};

/* ── Gallery ───────────────────────────────────── */

/* components/gallery/AlbumGrid.tsx */
export const albumGridUi: Localized<{
  photoViewer: (title: string) => string;
  fullSizeAlt: (title: string, n: number) => string;
  close: string;
  previousPhoto: string;
  nextPhoto: string;
  viewPhotoAria: (n: number, title: string) => string;
  photoAlt: (title: string, n: number) => string;
  download: string;
  downloadBlocked: string;
  dismiss: string;
}> = {
  en: {
    photoViewer: (title) => `${title} photo viewer`,
    fullSizeAlt: (title, n) => `${title} — photo ${n} full size`,
    close: "Close",
    previousPhoto: "Previous photo",
    nextPhoto: "Next photo",
    viewPhotoAria: (n, title) => `View photo ${n} of ${title} full size`,
    photoAlt: (title, n) => `${title} — photo ${n}`,
    download: "Download photo",
    downloadBlocked:
      "Download blocked — this looks like an ad blocker. This page doesn't run ads or collect data; try allowing it and downloading again.",
    dismiss: "Dismiss",
  },
  vi: {
    photoViewer: (title) => `Trình xem ảnh ${title}`,
    fullSizeAlt: (title, n) => `${title} — ảnh ${n} kích thước đầy đủ`,
    close: "Đóng",
    previousPhoto: "Ảnh trước",
    nextPhoto: "Ảnh sau",
    viewPhotoAria: (n, title) => `Xem ảnh ${n} của ${title} kích thước đầy đủ`,
    photoAlt: (title, n) => `${title} — ảnh ${n}`,
    download: "Tải ảnh xuống",
    downloadBlocked:
      "Tải ảnh bị chặn — có vẻ do trình chặn quảng cáo. Trang này không chạy quảng cáo hay thu thập dữ liệu, hãy thử cho phép rồi tải lại.",
    dismiss: "Đóng",
  },
};

/* components/gallery/GalleryModeSwitch.tsx */
export const galleryModeUi: Localized<{ label: string; still: string; motion: string }> = {
  en: { label: "Gallery view", still: "Still", motion: "Motion" },
  vi: { label: "Chế độ xem", still: "Tĩnh", motion: "Động" },
};

/* components/gallery/MotionSection.tsx */
export const motionUi: Localized<{
  list: string;
  albums: string;
  pick: (n: string) => string;
  empty: string;
  earlier: string;
  later: string;
}> = {
  en: {
    list: "Videos",
    albums: "Albums",
    pick: (n) => `Play ${n}`,
    empty: "Videos to be added.",
    earlier: "Scroll left",
    later: "Scroll right",
  },
  vi: {
    list: "Video",
    albums: "Album",
    pick: (n) => `Phát ${n}`,
    empty: "Video sẽ được thêm sau.",
    earlier: "Cuộn sang trái",
    later: "Cuộn sang phải",
  },
};

/* components/gallery/VideoPlayer.tsx */
export const videoPlayerUi: Localized<{
  play: string;
  pause: string;
  seek: string;
  volume: string;
  mute: string;
  unmute: string;
  download: string;
  fullView: string;
  exitFullView: string;
  nothing: string;
}> = {
  en: {
    play: "Play",
    pause: "Pause",
    seek: "Seek",
    volume: "Volume",
    mute: "Mute",
    unmute: "Unmute",
    download: "Download video",
    fullView: "Large view",
    exitFullView: "Close large view",
    nothing: "No video selected.",
  },
  vi: {
    play: "Phát",
    pause: "Tạm dừng",
    seek: "Tua",
    volume: "Âm lượng",
    mute: "Tắt tiếng",
    unmute: "Bật tiếng",
    download: "Tải video xuống",
    fullView: "Chế độ xem lớn",
    exitFullView: "Đóng chế độ xem lớn",
    nothing: "Chưa chọn video nào.",
  },
};

/* components/gallery/YearSelect.tsx */
export const yearSelectUi: Localized<{ filterByYear: string; all: string }> = {
  en: { filterByYear: "Filter by year", all: "All" },
  vi: { filterByYear: "Lọc theo năm", all: "Tất cả" },
};

/* ── Widgets ───────────────────────────────────── */

/* components/widgets/MusicPlayer.tsx */
export const musicPlayerUi: Localized<{
  music: string;
  mute: string;
  unmute: string;
  volume: string;
  back: string;
  trackList: string;
  close: string;
  loading: string;
  noTrackPlaying: string;
  shuffle: string;
  previousTrack: string;
  play: string;
  pause: string;
  nextTrack: string;
  repeatOff: string;
  repeatAll: string;
  repeatOne: string;
  none: string;
  allTracks: string;
  noAlbums: string;
  loadError: string;
  noTracks: string;
  musicPlayerLabel: string;
  swipeForControls: string;
}> = {
  en: {
    music: "Music",
    mute: "Mute",
    unmute: "Unmute",
    volume: "Volume",
    back: "Back",
    trackList: "Track list",
    close: "Close",
    loading: "Loading tracks…",
    noTrackPlaying: "No current playing track",
    shuffle: "Shuffle",
    previousTrack: "Previous track",
    play: "Play",
    pause: "Pause",
    nextTrack: "Next track",
    repeatOff: "Repeat: off",
    repeatAll: "Repeat: all",
    repeatOne: "Repeat: one track",
    none: "<None>",
    allTracks: "All tracks",
    noAlbums: "No albums available.",
    loadError: "Couldn't load tracks — try again later.",
    noTracks: "No tracks available.",
    musicPlayerLabel: "Music player",
    swipeForControls: "Swipe left for site controls",
  },
  vi: {
    music: "Nhạc",
    mute: "Tắt tiếng",
    unmute: "Bật tiếng",
    volume: "Âm lượng",
    back: "Quay lại",
    trackList: "Danh sách bài hát",
    close: "Đóng",
    loading: "Đang tải bài hát…",
    noTrackPlaying: "Chưa phát bài nào",
    shuffle: "Phát ngẫu nhiên",
    previousTrack: "Bài trước",
    play: "Phát",
    pause: "Tạm dừng",
    nextTrack: "Bài tiếp theo",
    repeatOff: "Lặp lại: tắt",
    repeatAll: "Lặp lại: tất cả",
    repeatOne: "Lặp lại: một bài",
    none: "<Không có>",
    allTracks: "Tất cả bài hát",
    noAlbums: "Không có album nào.",
    loadError: "Không tải được bài hát — thử lại sau.",
    noTracks: "Không có bài hát nào.",
    musicPlayerLabel: "Trình phát nhạc",
    swipeForControls: "Vuốt sang trái để mở điều khiển trang",
  },
};

/* components/widgets/NowPlaying.tsx */
export const nowPlayingUi: Localized<{ openPlayer: string }> = {
  en: { openPlayer: "Open music player" },
  vi: { openPlayer: "Mở trình phát nhạc" },
};

/* ── Pages ─────────────────────────────────────── */

/* pages/index.tsx */
export const homePageUi: Localized<{ greeting: string; viewGallery: string; aboutMe: string }> = {
  en: { greeting: "Hi, I'm", viewGallery: "View gallery", aboutMe: "About me" },
  vi: { greeting: "Xin chào, mình là", viewGallery: "Xem thư viện", aboutMe: "Về mình" },
};

/* pages/about.tsx */
export const aboutPageUi: Localized<{
  eyebrow: string;
  heading: string;
  aboutMe: string;
  favourites: string;
  skills: string;
  quickFacts: string;
  birthday: string;
  alias: string;
  currently: string;
  location: string;
}> = {
  en: {
    eyebrow: "Details",
    heading: "About me",
    aboutMe: "A bit info about myself",
    favourites: "Favourites",
    skills: "Skills",
    quickFacts: "Quick facts",
    birthday: "Birthday",
    alias: "Alias",
    currently: "Currently",
    location: "Location",
  },
  vi: {
    eyebrow: "Chi tiết",
    heading: "Mọi thứ về mình",
    aboutMe: "Một chút thông tin về bản thân",
    favourites: "Sở thích",
    skills: "Kỹ năng",
    quickFacts: "Tóm tắt bản thân",
    birthday: "Sinh nhật",
    alias: "Biệt danh",
    currently: "Tình trạng hiện tại",
    location: "Vị trí",
  },
};

/* pages/portfolio.tsx */
export const portfolioPageUi: Localized<{
  heading: string;
  achievements: string;
  projects: string;
  workJourney: string;
  photosToBeAdded: string;
}> = {
  en: {
    heading: "Highlights",
    achievements: "Achievements",
    projects: "Projects",
    workJourney: "Work journey",
    photosToBeAdded: "Photos to be added.",
  },
  vi: {
    heading: "Điểm nhấn",
    achievements: "Thành tựu",
    projects: "Dự án",
    workJourney: "Work journey",
    photosToBeAdded: "Ảnh sẽ được thêm sau.",
  },
};

/* pages/devices.tsx */
export const devicesPageUi: Localized<{ eyebrow: string; heading: string; description: string }> = {
  en: {
    eyebrow: "Devices & Equipment",
    heading: "Techy stuffs",
    description: "The hardware behind the work — phones, laptop, and the gears around them.",
  },
  vi: {
    eyebrow: "Thiết bị & Dụng cụ",
    heading: "Mấy món đồ công nghệ",
    description: "Phần cứng đằng sau mọi thứ mình làm — điện thoại, laptop, và các món đồ xung quanh nó.",
  },
};

/* pages/gallery.tsx */
export const galleryPageUi: Localized<{
  eyebrow: string;
  heading: string;
  all: string;
  photosToBeAdded: string;
  videosToBeAdded: string;
}> = {
  en: {
    eyebrow: "Gallery",
    heading: "Precious moments",
    all: "All",
    photosToBeAdded: "Photos to be added.",
    videosToBeAdded: "Videos to be added.",
  },
  vi: {
    eyebrow: "Thư viện",
    heading: "Những khoảnh khắc đẹp nhất",
    all: "Tất cả",
    photosToBeAdded: "Ảnh sẽ được thêm sau.",
    videosToBeAdded: "Video sẽ được thêm sau.",
  },
};

/* pages/contacts.tsx */
export const contactsPageUi: Localized<{
  eyebrow: string;
  heading: string;
  intro: string;
  workProfiles: string;
  otherSocial: string;
  buyCoffee: string;
}> = {
  en: {
    eyebrow: "Contacts",
    heading: "Say hello",
    intro: "The fastest way to reach me is email — I usually reply within a day.",
    workProfiles: "Work profiles",
    otherSocial: "Other social media",
    buyCoffee: "Buy me a coffee (Momo)",
  },
  vi: {
    eyebrow: "Liên hệ",
    heading: "Say hello",
    intro: "Trường hợp nhanh nhất bạn có thể gửi email cho mình, mình thường sẽ luôn phản hồi trong ngày",
    workProfiles: "Profile công việc",
    otherSocial: "Các mạng xã hội khác",
    buyCoffee: "Donate cho mình (Momo)",
  },
};
