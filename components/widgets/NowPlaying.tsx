import Icon from "../ui/Icons";
import Marquee from "../ui/Marquee";
import { useMusicPlayback } from "@/lib/musicState";
import { toggleMusicPlayer } from "../layout/ControlPanel";

export default function NowPlaying() {
  const { nowPlaying } = useMusicPlayback();
  const hasTrack = !!nowPlaying.title;
  const subtitle = nowPlaying.artist || nowPlaying.albumTitle || "";

  return (
    <div className="hubar-nowplaying-group">
      <button
        type="button"
        className={`hubar-nowplaying${hasTrack ? "" : " hubar-nowplaying--idle"}`}
        onClick={toggleMusicPlayer}
        title="Open music player"
        aria-label={
          hasTrack
            ? `${nowPlaying.playing ? "Playing" : "Paused"}: ${nowPlaying.title}${subtitle ? ` by ${subtitle}` : ""} — open music player`
            : "Open music player"
        }
      >
        <span className={`hubar-nowplaying-icon${nowPlaying.playing ? " hubar-nowplaying-icon--playing" : ""}`} aria-hidden="true">
          <Icon name="music" size={18} />
        </span>
        {hasTrack && (
          <span className="hubar-nowplaying-text" aria-hidden="true">
            <Marquee className="hubar-nowplaying-title">{nowPlaying.title}</Marquee>
            {subtitle && <Marquee className="hubar-nowplaying-subtitle">{subtitle}</Marquee>}
          </span>
        )}
      </button>
    </div>
  );
}
