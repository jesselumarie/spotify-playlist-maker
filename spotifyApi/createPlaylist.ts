import { Track, TrackMap, PlaylistMap } from "../pages/select";
import getTracksForPlaylist from "./getTracksForPlaylist";

type TrackWithMeta = {
  added_at: string
  added_by : any,
  is_local : boolean,
  primary_color : string,
  track : Track,
  video_thumbnail : {url: string}
}

export default async function createPlaylist({
  accessToken,
  userId,
  selectedPlaylistIds,
  title,
  selectedTrackURIs,
  setTracks,
  setPlaylists,
  setShowToast,
  setShowErrorToast,
}: {
  accessToken: string,
  userId: string,
  selectedPlaylistIds: string[],
  selectedTrackURIs: string[],
  title: string,
  setTracks: (value: TrackMap) => void,
  setPlaylists: (value: PlaylistMap) => void,
  setShowToast: (value: boolean) => void,
  setShowErrorToast: (value: boolean) => void,
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
  const trackRequestPromises = selectedPlaylistIds.map(async (pid) => {
    return getTracksForPlaylist({
      playlistId: pid,
      accessToken,
    });
  });

  const tracksGroupedByPlaylist = await Promise.all(trackRequestPromises);

  let playlistToTracks: {[key: string]: Array<TrackWithMeta>} = {};

  selectedPlaylistIds.forEach((pid, index) => {
    playlistToTracks[pid] = [...tracksGroupedByPlaylist[index]]; // make a copy
  });

  // loop through tracks and add to new playlist
  let stillTracksLeft = true;

  let newPlaylistTracks: TrackWithMeta[] = [];
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

  const trackURIs = [...newPlaylistTracks.map((t) => {
    return t.track.uri;
  }), ...selectedTrackURIs]

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
        uris: trackURIs.slice(0, 99), //TODO: make this work for multiple
      }),
    }
  );

  if (addItemsResponse.status >= 200 && addItemsResponse.status < 300) {
    setPlaylists({})
    setTracks({})
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  } else {
    setShowErrorToast(true)
    setTimeout(() => setShowErrorToast(false), 3000)
  }

}

