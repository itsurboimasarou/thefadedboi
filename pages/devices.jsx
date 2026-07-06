import { devices } from "../lib/devices.config";
import Icon, { specIconFor } from "../components/Icons";

const chevron = (
  <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

function SpecDropdown({ item }) {
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
          <img src={item.image} alt={item.name} className="spec-photo" />
        )}
        <dl className="spec-list">
          {item.specs.map((s) => (
            <div key={s.label}>
              <dt><Icon name={specIconFor(s.label)} size={15} />{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </details>
  );
}

export default function Devices() {
  return (
    <div className="stack reveal">
      <header>
        <p className="eyebrow">Devices &amp; Equipment</p>
        <h1>Stuffs that I'm having</h1>
        <p style={{ marginTop: 12, maxWidth: "100ch" }}>
          The hardware behind the work — phones, laptop, and the gears around them.
        </p>
      </header>

      {devices.map((group) => (
        <section key={group.category} className="glass">
          <h2 className="h-with-icon"><Icon name={group.category} />{group.categoryName}</h2>
          {group.items.some((i) => i.specs) ? (
            group.items.map((item) => <SpecDropdown key={item.name} item={item} />)
          ) : (
            <div className="grid grid--2">
              {group.items.map((item) => (
                <div key={item.name} className="gear-card">
                  <Icon name={item.icon ?? "gear"} size={26} />
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.detail}</p>
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
