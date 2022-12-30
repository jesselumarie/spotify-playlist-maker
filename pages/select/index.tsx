import { Dispatch, SetStateAction, useState } from "react";
import { NextPageContext } from 'next'
import Head from "next/head";
import { PlayableItem } from "../../components/PlayableItem";
import { SelectedTracksBanner } from "../../components/SelectedTracksBanner";
import createPlaylist from "../../spotifyApi/createPlaylist"
import styles from "../../styles/Home.module.css";
import toastStyles from "../../styles/Toast.module.css";
import InfiniteScroll from "react-infinite-scroll-component";


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

export interface ArtistMap {
  [key: string]: Artist | undefined;
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

type Image = {
  height: number,
  weidth: number,
  url: string
}

type Artist = {
    id: "06HL4z0CvFAxyc27GXpf02",
    images: Array<Image>
    name: string,
}

export enum SearchCategory {
  Track = "TRACK",
  Playlist = "PLAYLIST",
  Artist = "ARTIST",
}

interface Props {
    initialPlaylists: Playlist[];
    userId: string;
    accessToken: string | string[] | undefined;
    displayName: string,
    playlistMap: PlaylistMap;
    trackMap: TrackMap;
    initialTracks: Track[],
    initialArtists: Artist[],
    playlistTotal: number
    artistTotal: number
    trackTotal: number
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

type GetComponentForSelectionProps = {
  searchCategory: SearchCategory,
  playlists: Playlist[],
  selectedPlaylists: PlaylistMap,
  setPlaylistMap: (playlists: PlaylistMap) => void,
  tracks: Track[],
  selectedTracks: TrackMap,
  setTracks: (tracks: TrackMap) => void,
  artists: Artist[],
  selectedArtists: ArtistMap,
  setArtists: (artists: ArtistMap) => void
}

function getComponentForSelection({searchCategory, playlists, selectedPlaylists, setPlaylistMap, tracks, selectedTracks, setTracks, artists, selectedArtists, setArtists}: GetComponentForSelectionProps ){
  switch(searchCategory){
    case SearchCategory.Playlist:
      return playlists.map((playlist) => {
          const playlistSelected = selectedPlaylists[playlist.id];

          return (
            <PlayableItem
              title={playlist.name}
              subtitle={playlist.owner.display_name}
              imageUrl={playlist.images[0]?.url}
              key={playlist.id}
              selected={!!playlistSelected}
              handleButtonClick={() =>
                setPlaylistMap({
                  ...selectedPlaylists,
                  ... !playlistSelected ? { [playlist.id]: playlist } : { [playlist.id]: undefined },
                })
              }
              category={SearchCategory.Playlist}
            />
          );
        })
    case SearchCategory.Track:
      return tracks.map((track) => {
          const trackSelected = selectedTracks[track.id];

          return (
            <PlayableItem
              title={track.name}
              subtitle={track.artists.map((a) => a.name).join(',')}
              imageUrl={track.album.images[0]?.url}
              key={track.id}
              selected={!!trackSelected}
              handleButtonClick={() => setTracks({
                  ...selectedTracks,
                  ... !trackSelected ? { [track.id]: track} : {  [track.id]: undefined},
                })
              }
              category={SearchCategory.Track}
            />
          );

        })
    case SearchCategory.Artist:
      return artists.map((artist) => {
          const artistSelected = selectedArtists[artist.id];

          return (
            <PlayableItem
              title={artist.name}
              imageUrl={artist?.images[0]?.url || ''}
              key={artist.id}
              selected={!!artistSelected}
              handleButtonClick={() => setArtists({
                  ...selectedArtists,
                  ... !artistSelected ? { [artist.id]: artist} : {  [artist.id]: undefined},
                })
              }
              category={SearchCategory.Artist}
            />
          );

        })
  }
}


const urlForSearchCategory = {
  [SearchCategory.Artist]: 'https://api.spotify.com/v1/me/top/artists',
  [SearchCategory.Playlist]: 'https://api.spotify.com/v1/me/playlists',
  [SearchCategory.Track]: 'https://api.spotify.com/v1/me/top/tracks',
}

function getItemsForType(searchCategory: SearchCategory, playlists: Playlist[], tracks: Track[], artists: Artist[]) {
  switch (searchCategory) {
    case SearchCategory.Playlist:
      return playlists
    case SearchCategory.Track:
      return tracks
    case SearchCategory.Artist:
      return artists
  }
}

function SelectScreen({
  accessToken = '',
  artistTotal,
  displayName,
  initialArtists,
  initialPlaylists,
  initialTracks,
  playlistTotal,
  trackTotal,
  userId,
}: Props){
  const [searchCategory, setSearchCategory] = useState(SearchCategory.Playlist)

  const [tracks, setTracks] = useState(initialTracks)
  const [selectedTracks, setSelectedTracks] = useState({} as TrackMap);

  const [artists, setArtists] = useState(initialArtists)
  const [selectedArtists, setSelectedArtists] = useState({} as ArtistMap);

  const [playlists, setPlaylists] = useState(initialPlaylists)
  const [selectedPlaylists, setPlaylistMap] = useState({} as PlaylistMap);

  const [showToast, setShowToast] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)

  const itemTotalLength = {
    [SearchCategory.Artist]: artistTotal,
    [SearchCategory.Playlist]: playlistTotal,
    [SearchCategory.Track]: trackTotal,
  }

  const itemSetter: {[key in SearchCategory]: any} = {
    [SearchCategory.Artist]: setArtists,
    [SearchCategory.Playlist]: setPlaylists,
    [SearchCategory.Track]: setTracks,
  }

  const items = getItemsForType(searchCategory, playlists, tracks, artists)
  const itemsCurrentLength = items.length

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
        {/* TODO: update all calls to setSearchCategory to also clear requests */}
        <select onChange={(e) => setSearchCategory(e.target.value as SearchCategory)} name="playableType" id="media">
          <option value={SearchCategory.Playlist}>Playlists</option>
          <option value={SearchCategory.Track}>Tracks</option>
          <option value={SearchCategory.Artist}>Artists</option>
      </select>
        <InfiniteScroll
          dataLength={itemsCurrentLength} //This is important field to render the next data
          next={async () =>{
              // NOTE: setting this here so there won't be a race condition between
              // when updating the category and updating the item
              const currentSearchCategory = searchCategory
              const itemResponse = await fetch(
                `${urlForSearchCategory[searchCategory]}?offset=${itemTotalLength[searchCategory]-items.length+1}`,
                {
                  headers: {
                    Authorization: "Bearer " + accessToken,
                  },
                }
              )

              const itemJson = await itemResponse.json();
              const newItems = itemJson.items;
            // @ts-expect-error TODO: type this
              itemSetter[currentSearchCategory](items.concat(newItems))
          }}
          hasMore={itemsCurrentLength < itemTotalLength[searchCategory]}
          loader={<h4>Loading...</h4>}
          endMessage={
            <p style={{ textAlign: 'center' }}>
              <b>Yay! You have seen it all</b>
            </p>
          }
        >
          {getComponentForSelection({
            searchCategory,
            playlists,
            selectedPlaylists,
            setPlaylistMap,
            tracks,
            selectedTracks,
            setTracks: setSelectedTracks,
            artists,
            selectedArtists,
            setArtists: setSelectedArtists,
          })}
        </InfiniteScroll>

        <SelectedTracksBanner
          onClick={(title: string) =>
            createPlaylist({
              accessToken,
              userId,
              selectedPlaylistIds: getSelectedIds(selectedPlaylists),
              selectedTrackURIs: getTrackURIs(selectedTracks),
              title,
              setPlaylistMap,
              setTracks: setSelectedTracks,
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

type redirect = {
  redirect: {
    permanent: boolean,
    destination: string
  }
}
SelectScreen.getInitialProps = async (ctx: NextPageContext): Promise<Props | redirect> => {
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
  const playlistTotal = playlistJson.total

  if (!playlists) {
    // TODO: figure out if this works
    return {
      redirect: {
        permanent: false,
        destination: "/"
      }
    }
  }

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
  const trackTotal = tracksJson.total;

  const trackMap = tracks.reduce((acc: {[id: string]: TracksInfo}, t: TracksInfo) => {
    if (t.id) {
      acc[t.id] = t;
    }
    return acc;

  }, {});

  const artistResponse = await fetch(
  "https://api.spotify.com/v1/me/top/artists",
    {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }
  );

  const artistJson = await artistResponse.json();
  const artists = artistJson.items;
  const artistTotal = artistJson.total;

  const artistMap = artists.reduce((acc: {[id: string]: TracksInfo}, t: TracksInfo) => {
    if (t.id) {
      acc[t.id] = t;
    }
    return acc;

  }, {});

  return {
    accessToken,
    artistJson,
    artistMap,
    initialArtists: artists,
    displayName: meJson.display_name,
    playlistMap,
    initialPlaylists: playlists,
    playlistTotal,
    trackMap,
    initialTracks: tracks,
    tracksJson,
    userId: meJson.id,
    artistTotal,
    trackTotal,
  };
};

export default SelectScreen;
