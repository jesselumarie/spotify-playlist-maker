import { useState } from "react";
import { NextPageContext } from 'next'
import Head from "next/head";
import { PlayableItem } from "../../components/PlayableItem";
import { SelectedTracksBanner } from "../../components/SelectedTracksBanner";
import createPlaylist from "../../spotifyApi/createPlaylist"
import styles from "../../styles/Home.module.css";
import toastStyles from "../../styles/Toast.module.css";


interface TracksInfo {
  id: string,
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
    public: boolean;
    snapshot_id: string;
    tracks: TracksInfo;
    type: string;
    uri: string;
}

export interface PlaylistMap {
  [key: string]: Playlist | undefined;
}

export interface Track {
  album: any;
  artists: Array<{name: string}>
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

export interface TrackMap {
  [key: string]: Track | undefined;
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

export interface GetTracksForPlaylistsArgs {
  accessToken: string;
  playlistId: string;
}

function getSelectedIds(selectableMap: {[key: string]: any}) {
  return Object.keys(selectableMap).filter((pid) => selectableMap[pid]);
}

function notNull<T>(val: T | undefined): val is T {
    return !!val;
}

function getTrackURIs(trackMap: TrackMap): string[] {
  return Object.values(trackMap).filter(notNull).map((t) => t.uri);
}

function SelectScreen({
  playlists,
  userId,
  accessToken,
  displayName,
  playlistMap,
  tracks,
}: Props){
  const [searchCategory, setSearchCategory] = useState(SearchCategory.Playlist)
  const [selectedTracks, setTracks] = useState({} as TrackMap);
  const [selectedPlaylists, setPlaylists] = useState({} as PlaylistMap);
  const [showToast, setShowToast] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const selectedCount = getSelectedIds(selectedPlaylists).length + getSelectedIds(selectedTracks).length;

  return (
    <div className={styles.container}>
      <Head>
        <title>{displayName}'s Spotify info</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {showToast && <div className={toastStyles.toast}>Success ⚡️</div>}
        {showErrorToast && <div className={`${toastStyles.toast} ${toastStyles.errorToast}`}>Something went wrong, please try again</div>}
        <select onChange={(e) => setSearchCategory(e.target.value as SearchCategory)} name="playableType" id="media">
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
                  ... !playlistSelected ? { [playlist.id]: playlist } : { [playlist.id]: undefined },
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
                  ... !trackSelected ? { [track.id]: track} : {  [track.id]: undefined},
                })
              }
            />
          );

        })}

        <SelectedTracksBanner
          onClick={(title: string) =>
            createPlaylist({
              accessToken,
              userId,
              selectedPlaylistIds: getSelectedIds(selectedPlaylists),
              selectedTrackURIs: getTrackURIs(selectedTracks),
              title,
              setPlaylists,
              setTracks,
              setShowToast,
              setShowErrorToast,
            })
          }
          count={selectedCount}
        />
      </main>
    </div>
  );
}

SelectScreen.getInitialProps = async (ctx: NextPageContext) => {
  const { accessToken } = ctx.query || '';
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

  const playlistMap = playlists.reduce((acc: PlaylistMap, p: Playlist) => {
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

  const trackMap = tracks.reduce((acc: {[id: string]: TracksInfo}, t: TracksInfo) => {
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
    tracks,
    trackMap,
    tracksJson
  };
};

export default SelectScreen;
