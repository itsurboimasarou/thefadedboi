import { useEffect, useState } from "react";

function wholeYears(birthday) {
  const b = new Date(birthday);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const beforeBirthdayThisYear =
    now.getMonth() < b.getMonth() ||
    (now.getMonth() === b.getMonth() && now.getDate() < b.getDate());
  if (beforeBirthdayThisYear) age -= 1;
  return age;
}

function ordinal(day) {
  if (day % 100 >= 11 && day % 100 <= 13) return `${day}th`;
  switch (day % 10) {
    case 1: return `${day}st`;
    case 2: return `${day}nd`;
    case 3: return `${day}rd`;
    default: return `${day}th`;
  }
}

export default function LiveAge({ birthday }) {
  const [age, setAge] = useState(null);

  useEffect(() => {
    if (!birthday || Number.isNaN(new Date(birthday).getTime())) return;
    const tick = () => setAge(wholeYears(birthday));
    tick();
    const id = setInterval(tick, 60_000); // re-check each minute; flips on the birthday
    return () => clearInterval(id);
  }, [birthday]);

  const b = new Date(birthday);
  const month = b.toLocaleDateString("en-GB", { month: "long" });
  const date = `${ordinal(b.getDate())} ${month} ${b.getFullYear()}`;

  return (
    <span suppressHydrationWarning>
      {date}{age !== null && ` (${age} years old)`}
    </span>
  );
}
