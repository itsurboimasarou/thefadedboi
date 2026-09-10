import { siteName } from "@/lib/configs/site.config";
import { details as detailsConfig, detailsAvatar, detailsSkills, detailsFacts } from "@/lib/configs/details.config";
import { homeEyebrow } from "@/lib/configs/home.config";
import { useLocalized } from "@/lib/i18n";
import { aboutPageUi as ui } from "@/lib/ui-strings";
import Icon from "@/components/ui/Icons";
import Favourites from "@/components/content/Favourites";
import LiveAge from "@/components/widgets/LiveAge";
import Image from "next/image";
import { getChangelog } from "@/lib/assets";

export async function getStaticProps() {
  return { props: { changelog: await getChangelog() }, revalidate: 300 };
}

export default function About() {
  const details = useLocalized(detailsConfig);
  const t = useLocalized(ui);
  return (
    <div className="stack reveal">
      <header className="about-hero">
        <Image
          src={detailsAvatar}
          alt={`Portrait of ${siteName}`}
          className="avatar"
          width={336}
          height={336}
          quality={75}
          priority
          sizes="(max-width: 768px) 120px, 168px"
        />
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.heading}</h1>
          <p style={{ marginTop: 10 }}>{homeEyebrow}</p>
        </div>
      </header>

      <section className="glass">
        <h2 className="h-with-icon"><Icon name="pen" />{t.aboutMe}</h2>
        {details.aboutMe.map((para, i) => (
          <p key={i} style={{ marginTop: i ? 12 : 0 }}>{para}</p>
        ))}
      </section>

      <section className="glass">
        <h2 className="h-with-icon"><Icon name="heart" />{t.favourites}</h2>
        <Favourites likes={details.likes} />
      </section>

      <section className="grid grid--2">
        <div className="glass glass--hover">
          <h2 className="h-with-icon"><Icon name="spark" />{t.skills}</h2>
          <div>
            {detailsSkills.map((s) => (
              <span className="chip" key={s}>{s}</span>
            ))}
          </div>
        </div>
        <div className="glass glass--hover">
          <h2 className="h-with-icon"><Icon name="info" />{t.quickFacts}</h2>
          <dl className="fact-grid">
            <div>
              <dt><Icon name="cake" size={15} />{t.birthday}</dt>
              <dd><LiveAge birthday={detailsFacts.birthday} /></dd>
            </div>
            <div>
              <dt><Icon name="target" size={15} />{t.alias}</dt>
              <dd>{detailsFacts.alias}</dd>
            </div>
            <div>
              <dt><Icon name="briefcase" size={15} />{t.currently}</dt>
              <dd>{details.facts.currently}</dd>
            </div>
            <div>
              <dt><Icon name="pin" size={15} />{t.location}</dt>
              <dd>{details.facts.location}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
