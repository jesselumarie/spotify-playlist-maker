import { useState } from "react";
import { NextPage } from 'next'
import Head from "next/head";
import { PlayableItem } from "../../components/PlayableItem";
import { SelectedTracksBanner } from "../../components/SelectedTracksBanner";
import createPlaylist from "../../spotifyApi/createPlaylist.ts"
import getTracksForPlaylistIds from "../../spotifyApi/getTracksForPlaylist.ts"
import styles from "../../styles/Home.module.css";

interface TracksInfo {
  href: string;
  total: number;
}

interface Owner {
  display_name: string;
  external_urls: any[];  // TODO: type this,
  href: string;
  id: string;
  type: string;
  uri: string;
}

interface ExternalUrls {
  spotify: string
}

interface Playlist {
    collaborative: boolean;
    description: string;
    external_urls: ExternalUrls;
    href: string;
    id: string;
    images: any[]; //TODO: type this,
    name: string;
    owner: Owner;
    primary_color?: string;
    public: bool;
    snapshot_id: string;
    tracks: TracksInfo;
    type: string;
    uri: string;
}

interface PlaylistMap {
  [string]: Playlist;
}

interface Track {
  album: any;
  artists: [];
  external_ids: {isrc: string};
  external_urls: {spotify: string};
  href: string;
  id: "0BLY78hYpsH9NqP6X0N8CX"
  is_local: boolean;
  name: string;
  preview_url: string;
  type: "track"
  uri: string;
}

interface TrackMap {
  [string]: any;
}

enum SearchCategory {
  Track = "TRACK",
  Playlist = "PLAYLIST",
}

interface Props {
    playlists: Playlist[];
    userId: string;
    accessToken: string;
    displayName: string,
    playlistMap: PlaylistMap;
    trackMap: TrackMap;
    tracks: Track[],
}

interface GetTracksForPlaylistsArgs {
  accessToken: string;
  playlistId: string;
}

function getSelectedIds(selectableMap) {
  return Object.keys(selectableMap).filter((pid) => selectableMap[pid]);
}


const SelectScreen: NextPage<Props> = ({
  playlists,
  userId,
  accessToken,
  displayName,
  playlistMap,
  trackMap,
  tracks,
}) => {
  const [searchCategory, setSearchCategory] = useState(SearchCategory.Playlist)
  const [selectedTracks, setTracks] = useState({});
  const [selectedPlaylists, setPlaylists] = useState({});
  const selectedCount = getSelectedIds(selectedPlaylists).length + getSelectedIds(selectedTracks).length;

  return (
    <div className={styles.container}>
      <Head>
        <title>{displayName}'s Spotify info</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <select onChange={(e) => setSearchCategory(e.target.value)} name="playableType" id="media">
          <option value={SearchCategory.Playlist}>Playlists</option>
          <option value={SearchCategory.Track}>Tracks</option>
      </select>
        {searchCategory === SearchCategory.Playlist ? playlists.map((playlist) => {
          const playlistSelected = selectedPlaylists[playlist.id];

          return (
            <PlayableItem
              title={playlist.name}
              subtitle={playlist.owner.display_name}
              imageUrl={playlist.images[0]?.url}
              key={playlist.id}
              selected={playlistSelected}
              handleButtonClick={() =>
                setPlaylists({
                  ...selectedPlaylists,
                  ...{ [playlist.id]: !playlistSelected },
                })
              }
            />
          );

        }) : tracks.map((track) => {
          const trackSelected = selectedTracks[track.id];

          return (
            <PlayableItem
              title={track.name}
              subtitle={track.artists.map((a) => a.name).join(',')}
              imageUrl={track.album.images[0]?.url}
              key={track.id}
              selected={trackSelected}
              handleButtonClick={() => setTracks({
                  ...selectedTracks,
                  ...{ [track.id]: !trackSelected},
                })
              }
            />
          );

        })}
        <SelectedTracksBanner
          onClick={(title) =>
            createPlaylist({
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

  const tracksResponse = await fetch(
    "https://api.spotify.com/v1/me/top/tracks",
    {
      headers: {

        Authorization: "Bearer " + accessToken,
      },
    }
  );

  const tracksJson = await tracksResponse.json();
  const tracks = tracksJson.items;

  const trackMap = tracks.reduce((acc, t) => {
    if (t.id) {
      acc[t.id] = t;
    }
    return acc;

  }, {});

  return {
    displayName: meJson.display_name,
    userId: meJson.id,
    playlists,
    playlistMap,
    accessToken,
    playlists,
    tracks,
    trackMap,
    tracksJson
  };
};

export default SelectScreen;
