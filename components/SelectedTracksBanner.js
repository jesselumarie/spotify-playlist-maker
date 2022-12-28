import { useState } from "react";
import styles from "../styles/SelectedTracksBanner.module.css"

const defaultTitle = `New Playlist ${new Date().getTime()}`;

function SelectedTracksBanner({ count = 0, onClick }) {
  const [showOptions, toggleOptions] = useState(false);
  const [playlistTitle, setTitle] = useState(defaultTitle);

  return (
    <div className={styles.footerStyle}>
      <div className={styles.topSectionStyle}>
        <p style={{ marginRight: "12px" }}>
          <b>{count} </b> {`${count == 1 ? "item" : "items"} selected`}
        </p>
        <button
          onClick={() => {
            toggleOptions(!showOptions);
          }}
          style={{ height: "36px", marginRight: "12px" }}
        >
          Options
        </button>
        <button
          onClick={() => onClick(playlistTitle)}
          style={{ height: "36px", marginRight: "12px" }}
        >
          Create playlist ⚡️
        </button>
      </div>
      <div className={styles.bottomSectionStyle}>
        {showOptions && (
          <>
            <label className={styles.labelStyle} htmlFor="playlistTitle">
              Playlist Title
            </label>
            <input
              type="text"
              id="playlistTitle"
              name="playlistTitle"
              onChange={(event) => {
                setTitle(event.target.value);
              }}
              value={playlistTitle}
            />
          </>
        )}
      </div>
    </div>
  );
}

export { SelectedTracksBanner };
