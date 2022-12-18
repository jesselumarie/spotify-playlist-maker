export default async function createPlaylist({
  accessToken,
  userId,
  selectedPlaylistIds,
  playlistMap,
  title,
}: {
  accessToken: string,
  userId: string,
  selectedPlaylistIds: string[],
  playlistMap: PlaylistMap,
  title: string
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
        uris: trackURIs.slice(0, 99), //TODO: make this work for multiple
      }),
    }
  );
}

