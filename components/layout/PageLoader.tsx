import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function PageLoader() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let delay: ReturnType<typeof setTimeout> | null = null;
    const start = () => {
      if (delay) clearTimeout(delay);
      delay = setTimeout(() => setLoading(true), 150);
    };
    const done = () => {
      if (delay) {
        clearTimeout(delay);
        delay = null;
      }
      setLoading(false);
    };

    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", done);
    router.events.on("routeChangeError", done);
    return () => {
      if (delay) clearTimeout(delay);
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", done);
      router.events.off("routeChangeError", done);
    };
  }, [router.events]);

  if (!loading) return null;

  return (
    <div className="page-loader" role="status" aria-live="polite">
      <span className="page-loader-ring" aria-hidden="true" />
      <span className="sr-only">Loading page…</span>
    </div>
  );
}
