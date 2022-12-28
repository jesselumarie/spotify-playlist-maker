function redirectToSpotifyLogin({ clientId, scopes, redirectUri }) {
  const spotifyUrl = `https://accounts.spotify.com/authorize?\
response_type=token\
&client_id=${encodeURIComponent(clientId)}\
&scope=${encodeURIComponent(scopes)}\
&redirect_uri=${encodeURIComponent(redirectUri)}\
`;
  // TODO: add some state for security
  // &state=${encodeURIComponent(state)}`

  window.location = spotifyUrl;
  return;
}

export function LogInButton() {
  return (
    <button
      onClick={() => redirectToSpotifyLogin({
        clientId: "5036cea918584f5d816f6d35923c4dcf",
        scopes: "user-read-private user-read-email user-read-recently-played user-top-read user-read-playback-position user-library-read playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative",
        redirectUri: "http://localhost:3000/callback"
      })}
    >
      Log in with Spotify
    </button>
  );
}
