import { useEffect, useState } from "react";
import { setLiteMode } from "./LiteMode";
import LangSwitch from "./LangSwitch";
import { useLocalized, type Localized } from "@/lib/i18n";

const KEY = "important-notice-seen";

const ui: Localized<{
  title: string;
  motionHeading: string;
  motionBody: string;
  keepDefault: string;
  useLite: string;
  blockerHeading: string;
  blockerBody: string;
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
    once: "Đây là thông báo một lần, và bạn có thể thay đổi lựa chọn sau đó.",
  },
};

export default function ImportantNotice() {
  const t = useLocalized(ui);
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const osReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!localStorage.getItem(KEY) && !osReduced) setShow(true);
    } catch {}
  }, []);

  useEffect(() => {
    if (!show) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [show]);

  const choose = (reduce: boolean) => {
    setLiteMode(reduce);
    try { localStorage.setItem(KEY, "1"); } catch {}
    setShow(false);
    window.dispatchEvent(new Event("lite-mode-changed"));
  };

  if (!show) return null;

  return (
    <div className="notice-backdrop">
      <div
        className="glass important-notice"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="important-notice-title"
      >
        <div className="important-notice-head">
          <h2 id="important-notice-title" className="important-notice-title">
            {t.title}
          </h2>
          <LangSwitch />
        </div>

        <section className="notice-section">
          <h3 className="notice-section-heading">{t.motionHeading}</h3>
          <p>{t.motionBody}</p>
          <div className="notice-actions">
            <button type="button" className="btn btn--small" onClick={() => choose(false)}>
              {t.keepDefault}
            </button>
            <button type="button" className="btn btn--small btn--ghost" onClick={() => choose(true)}>
              {t.useLite}
            </button>
          </div>
        </section>

        <section className="notice-section">
          <h3 className="notice-section-heading">{t.blockerHeading}</h3>
          <p>{t.blockerBody}</p>
        </section>

        <p className="notice-footnote">{t.once}</p>
      </div>
    </div>
  );
}
