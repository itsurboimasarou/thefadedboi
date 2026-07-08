import { contacts } from "@/lib/contacts.config";
import CopyEmailButton from "@/components/contact/CopyEmailButton";
import { ContactIcon } from "@/components/contact/ContactIcon";
import Icon from "@/components/ui/Icons";

function LinkCard({ item }) {
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
  return (
    <div className="stack reveal">
      <header>
        <p className="eyebrow">Contacts</p>
        <h1>Say hello</h1>
        <p style={{ marginTop: 12, maxWidth: "100ch" }}>
          The fastest way to reach me is email — I usually reply within a day.
        </p>
        <div style={{ marginTop: 20 }}>
          <CopyEmailButton email={contacts.email} />
        </div>
      </header>

      <section>
        <h2 className="h-with-icon"><Icon name="mail" />Work profiles</h2>
        <div className="grid grid--2">
          {contacts.direct.map((c) => <LinkCard key={c.label} item={c} />)}
        </div>
      </section>

      <section>
        <h2 className="h-with-icon"><Icon name="share" />Other social media</h2>
        <div className="grid grid--2">
          {contacts.socials.map((s) => <LinkCard key={s.label} item={s} />)}
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
          Buy me a coffee
        </a>
      </section>
    </div>
  );
}
