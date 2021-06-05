import { useState } from "react";
const footerStyle = {
  position: "fixed",
  left: 0,
  bottom: 0,
  width: "100%",
  minHeight: "70px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "white",
  boxShadow: "0 2px 5px 1px rgb(64 60 67 / 16%)",
};

const topSectionStyle = {
  display: "flex",
  alignItems: "center",
};

const bottomSectionStyle = {
  display: "flex",
  alignItems: "center",
  marginTop: 10,
  marginBottom: 10,
};

const labelStyle = {
  display: "inline-block",
  margin: 10,
  fontWeight: "bold",
};

const defaultTitle = `New Playlist ${new Date().getTime()}`;

function SelectedTracksBanner({ count = 0, onClick }) {
  const [showOptions, toggleOptions] = useState(false);
  const [playlistTitle, setTitle] = useState(defaultTitle);

  return (
    <div style={footerStyle}>
      <div style={topSectionStyle}>
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
          <b>Create playlist ⚡️</b>
        </button>
      </div>
      <div style={bottomSectionStyle}>
        {showOptions && (
          <>
            <label style={labelStyle} htmlFor="playlistTitle">
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
