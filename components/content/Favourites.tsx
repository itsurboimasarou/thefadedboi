import { useState } from "react";
import type { Like } from "@/lib/types";

export default function Favourites({ likes }: { likes: Like[] }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div>
      <div className="like-bubbles">
        {likes.map((like, i) => (
          <button
            key={like.label}
            type="button"
            className="like-bubble"
            aria-pressed={active === i}
            onClick={() => setActive(active === i ? null : i)}
          >
            {like.label}
          </button>
        ))}
      </div>
      {active !== null && (
        <p className="like-detail" key={active}>
          {likes[active].text}
        </p>
      )}
    </div>
  );
}
