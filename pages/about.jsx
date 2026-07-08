import { site } from "../lib/site.config";
import { details } from "../lib/details.config";
import Icon from "@/components/ui/Icons";
import WhatILike from "@/components/content/WhatILike";
import LiveAge from "@/components/widgets/LiveAge";
import Image from "next/image";

export default function About() {
  return (
    <div className="stack reveal">
      <header className="about-hero">
        <Image
          src={details.avatar}
          alt={`Portrait of ${site.name}`}
          className="avatar"
          width={336}
          height={336}
          quality={75}
          priority
          sizes="(max-width: 768px) 120px, 168px"
        />
        <div>
          <p className="eyebrow">Details</p>
          <h1>Much more about me</h1>
          <p style={{ marginTop: 10 }}>{site.role}</p>
        </div>
      </header>

      <section className="glass">
        <h2 className="h-with-icon"><Icon name="pen" />About me</h2>
        {details.aboutMe.map((para, i) => (
          <p key={i} style={{ marginTop: i ? 12 : 0 }}>{para}</p>
        ))}
      </section>

      <section className="glass">
        <h2 className="h-with-icon"><Icon name="heart" />What I like</h2>
        <WhatILike likes={details.likes} />
      </section>

      <section className="grid grid--2">
        <div className="glass glass--hover">
          <h2 className="h-with-icon"><Icon name="spark" />Skills</h2>
          <div>
            {details.skills.map((s) => (
              <span className="chip" key={s}>{s}</span>
            ))}
          </div>
        </div>
        <div className="glass glass--hover">
          <h2 className="h-with-icon"><Icon name="info" />Quick facts</h2>
          <dl className="fact-grid">
            <div>
              <dt><Icon name="cake" size={15} />Birthday</dt>
              <dd><LiveAge birthday={details.facts.birthday} /></dd>
            </div>
            <div>
              <dt><Icon name="target" size={15} />Alias</dt>
              <dd>{details.facts.alias}</dd>
            </div>
            <div>
              <dt><Icon name="briefcase" size={15} />Currently</dt>
              <dd>{details.facts.currently}</dd>
            </div>
            <div>
              <dt><Icon name="pin" size={15} />Location</dt>
              <dd>{details.facts.location}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
