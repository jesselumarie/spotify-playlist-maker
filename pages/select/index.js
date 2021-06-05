import { useState } from "react";
import Head from "next/head";
import { PlayableItem } from "../../components/PlayableItem";
import { SelectedTracksBanner } from "../../components/SelectedTracksBanner";
import styles from "../../styles/Home.module.css";

async function getTracksForPlaylist({ accessToken, playlistId }) {
  const playlistTracks = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }
  );
  const playlistTracksJson = await playlistTracks.json();

  return playlistTracksJson.items;
}

async function handleCreatePlaylist({
  accessToken,
  userId,
  selectedPlaylistIds,
  playlistMap,
  title,
}) {
  // create new playlist
  const newPlaylistResponse = await fetch(
    `https://api.spotify.com/v1/users/${userId}/playlists`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
      body: JSON.stringify({
        name: title,
        public: false,
      }),
    }
  );
  const newPlaylistJson = await newPlaylistResponse.json();
  const newPlaylistId = newPlaylistJson.id;

  // TODO: handle pagination
  // get items for playlist
  const trackRequestPromises = await selectedPlaylistIds.map(async (pid) => {
    return getTracksForPlaylist({
      playlistId: pid,
      accessToken,
    });
  });

  const tracksGroupedByPlaylist = await Promise.all(trackRequestPromises);

  let playlistToTracks = {};

  selectedPlaylistIds.forEach((pid, index) => {
    playlistToTracks[pid] = [...tracksGroupedByPlaylist[index]]; // make a copy
  });

  // loop through tracks and add to new playlist
  let stillTracksLeft = true;

  let newPlaylistTracks = [];
  while (stillTracksLeft) {
    let emptyTrackLists = 0;
    tracksGroupedByPlaylist.forEach((tracks) => {
      if (tracks.length > 0) {
        newPlaylistTracks.push(tracks.shift());
      } else {
        emptyTrackLists += 1;
      }
    });

    if (emptyTrackLists === tracksGroupedByPlaylist.length) {
      stillTracksLeft = false;
    }
  }

  const trackURIs = newPlaylistTracks.map((t) => {
    return t.track.uri;
  });

  // TODO: abstract away into chunked work
  const addItemsResponse = await fetch(
    `https://api.spotify.com/v1/playlists/${newPlaylistId}/tracks`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: trackURIs.slice(0,99), //TODO: make this work for multiple
      }),
    }
  );
}

function getSelectedPlaylistIds(selectedPlaylists) {
  return Object.keys(selectedPlaylists).filter((pid) => selectedPlaylists[pid]);
}

function SelectScreen({
  playlists,
  userId,
  accessToken,
  displayName,
  playlistJson,
  playlistMap,
}) {
  const [selectedPlaylists, setPlaylists] = useState({});
  const selectedCount = getSelectedPlaylistIds(selectedPlaylists).length;
  console.log(playlists);

  return (
    <div className={styles.container}>
      <Head>
        <title>{displayName}'s Spotify info</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {playlists.map((playlist) => {
          const selected = selectedPlaylists[playlist.id];
          return (
            <PlayableItem
              title={playlist.name}
              subtitle={playlist.owner.display_name}
              imageUrl={playlist.images[0]?.url}
              key={playlist.id}
              selected={selected}
              handleButtonClick={() =>
                setPlaylists({
                  ...selectedPlaylists,
                  ...{ [playlist.id]: !selected },
                })
              }
            />
          );
        })}
        <SelectedTracksBanner
          onClick={(title) =>
            handleCreatePlaylist({
              accessToken,
              userId,
              playlistMap,
              selectedPlaylistIds: getSelectedPlaylistIds(selectedPlaylists),
              title,
            })
          }
          count={selectedCount}
        />
      </main>
    </div>
  );
}

SelectScreen.getInitialProps = async (ctx) => {
  const { accessToken } = ctx.query;
  const meResponse = await fetch("https://api.spotify.com/v1/me?limit=50", {
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });
  const meJson = await meResponse.json();

  const playlistResponse = await fetch(
    "https://api.spotify.com/v1/me/playlists",
    {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }
  );
  const playlistJson = await playlistResponse.json();
  const playlists = playlistJson.items;
  const playlistMap = playlists.reduce((acc, p) => {
    if (p.id) {
      acc[p.id] = p;
    }
    return acc;
  }, {});

  return {
    displayName: meJson.display_name,
    userId: meJson.id,
    playlists,
    playlistMap,
    accessToken,
    playlistJson,
    playlists,
  };
};

export default SelectScreen;
