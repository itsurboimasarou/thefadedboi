import Icon from "../ui/Icons";
import Marquee from "../ui/Marquee";
import { useMusicPlayback, setVolume, setMuted } from "@/lib/musicState";
import { toggleMusicPlayer } from "../layout/ControlPanel";

export default function NowPlaying() {
  const { nowPlaying, volume, muted } = useMusicPlayback();
  const hasTrack = !!nowPlaying.title;
  const subtitle = nowPlaying.artist || nowPlaying.albumTitle || "";
  const isMuted = muted || volume === 0;

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

      <div className="hubar-volume">
        <button
          type="button"
          className="hubar-volume-btn"
          onClick={() => setMuted(!muted)}
          aria-pressed={muted}
          aria-label={muted ? "Unmute" : "Mute"}
          title={muted ? "Unmute" : "Mute"}
        >
          <Icon name={isMuted ? "volumeMute" : "volumeHigh"} size={18} />
        </button>
        <input
          type="range"
          className="hubar-volume-slider"
          min={0}
          max={100}
          value={Math.round((isMuted ? 0 : volume) * 100)}
          onChange={(e) => {
            const v = Number(e.target.value) / 100;
            setVolume(v);
            if (muted && v > 0) setMuted(false);
          }}
          aria-label="Volume"
        />
      </div>
    </div>
  );
}
