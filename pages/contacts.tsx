import { contacts } from "@/lib/configs/contacts.config";
import CopyEmailButton from "@/components/contact/CopyEmailButton";
import { ContactIcon } from "@/components/contact/ContactIcon";
import Icon from "@/components/ui/Icons";
import { useLocalized, type Localized } from "@/lib/i18n";

import type { LinkItem } from "@/lib/types";
import { getChangelog } from "@/lib/assets";

export async function getStaticProps() {
  return { props: { changelog: await getChangelog() }, revalidate: 300 };
}

const ui: Localized<{
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

function LinkCard({ item }: { item: LinkItem }) {
  return (
    <a href={item.href} className="glass glass--hover contact-card" target="_blank" rel="noopener noreferrer">
      <ContactIcon name={item.label} />
      <span>
        <p className="eyebrow" style={{ marginBottom: 6 }}>{item.label}</p>
        <h3 style={{ color: "var(--ink)" }}>{item.value}</h3>
      </span>
    </a>
  );
}

export default function Contacts() {
  const t = useLocalized(ui);
  return (
    <div className="stack reveal">
      <header>
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.heading}</h1>
        <p style={{ marginTop: 12, maxWidth: "100ch" }}>
          {t.intro}
        </p>
        <div style={{ marginTop: 20 }}>
          <CopyEmailButton email={contacts.email} />
        </div>
      </header>

      <section>
        <h2 className="h-with-icon"><Icon name="mail" />{t.workProfiles}</h2>
        <div className="grid grid--2">
          {contacts.direct.map((c) => <LinkCard key={c.href ?? c.label} item={c} />)}
        </div>
      </section>

      <section>
        <h2 className="h-with-icon"><Icon name="share" />{t.otherSocial}</h2>
        <div className="grid grid--2">
          {contacts.socials.map((s) => <LinkCard key={s.href ?? s.label} item={s} />)}
        </div>
      </section>

      <section style={{ textAlign: "center", marginTop: 80}}>
        <a
          href={contacts.donateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--pill"
        >
          <Icon name="heart" size={18} />
          {t.buyCoffee}
        </a>
      </section>
    </div>
  );
}
