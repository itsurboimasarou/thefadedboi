import type { InferGetStaticPropsType } from "next";
import { getDevices, deviceImage } from "@/lib/assets";
import { getChangelog } from "@/lib/changelog";
import Icon, { specIconFor } from "@/components/ui/Icons";
import type { DeviceItem } from "@/lib/types";
import { useLocalized } from "@/lib/i18n";
import { devicesPageUi as ui } from "@/lib/ui-strings";
import { useLang } from "@/components/controls/LangSwitch";

const chevron = (
  <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

function SpecDropdown({ item }: { item: DeviceItem }) {
  const lang = useLang();
  return (
    <details className="spec-item" open>
      <summary>
        <span>
          {item.tag && <span className="spec-tag">{item.tag}</span>}
          <h3 style={{ display: "inline" }}>{item.name}</h3>
        </span>
        {chevron}
      </summary>
      <div className="spec-body">
        {item.image && (
          <img src={deviceImage(item.image)} alt={item.name} className="spec-photo" loading="lazy" />
        )}
        <dl className="spec-list">
          {(item.specs ?? []).map((s) => (
            <div key={s.label.en}>
              <dt><Icon name={specIconFor(s.label.en)} size={15} />{s.label[lang]}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </details>
  );
}

function CollectionCard({ item }: { item: DeviceItem }) {
  const lang = useLang();
  return (
    <article className="gear-card collection-card">
      {item.image ? (
        <img src={deviceImage(item.image)} alt={item.name} className="collection-photo" loading="lazy" />
      ) : (
        <span className="collection-photo collection-photo--placeholder" aria-hidden="true">
          <Icon name={item.icon ?? "collection"} size={30} />
        </span>
      )}
      <div className="collection-info">
        {(item.tag || item.year) && (
          <p className="collection-meta">
            {item.tag && <span className="spec-tag">{item.tag}</span>}
            {item.year && <span className="collection-year">{item.year}</span>}
          </p>
        )}
        <h3>{item.name}</h3>
        {item.detail && <p>{item.detail[lang]}</p>}
      </div>
    </article>
  );
}

export async function getStaticProps() {
  return { props: { changelog: await getChangelog(), devices: await getDevices() }, revalidate: 300 };
}

export default function Devices({
  devices,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const t = useLocalized(ui);
  const lang = useLang();
  return (
    <div className="stack reveal">
      <header>
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.heading}</h1>
        <p style={{ marginTop: 12, maxWidth: "100ch" }}>
          {t.description}
        </p>
      </header>

      {devices.map((group) => (
        <section key={group.category} className="glass">
          <h2 className="h-with-icon"><Icon name={group.category} />{group.categoryName[lang]}</h2>
          {group.description && <p className="collection-desc">{group.description[lang]}</p>}
          {group.layout === "collection" ? (
            <div className="collection-grid">
              {group.items.map((item) => <CollectionCard key={item.name} item={item} />)}
            </div>
          ) : group.items.some((i) => i.specs) ? (
            group.items.map((item) => <SpecDropdown key={item.name} item={item} />)
          ) : (
            <div className="grid grid--2">
              {group.items.map((item) => (
                <div key={item.name} className="gear-card">
                  <Icon name={item.icon ?? "gear"} size={26} />
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.detail?.[lang]}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
