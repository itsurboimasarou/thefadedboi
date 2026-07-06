import { useState } from "react";

export default function WhatILike({ likes }) {
  const [active, setActive] = useState(null);

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
