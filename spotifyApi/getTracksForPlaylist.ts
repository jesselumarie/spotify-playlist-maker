import type { GetTracksForPlaylistsArgs } from '../pages/select/index'

export default async function getTracksForPlaylist({ accessToken, playlistId }: GetTracksForPlaylistsArgs) {
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

