import Head from "next/head";
import styles from "../../styles/Home.module.css";
import { useRouter } from 'next/router'

function Me(props) {
  console.log(props)
  return (
    <div className={styles.container}>
      <Head>
        <title>{props.display_name}'s Spotify info</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Display Name: {props.display_name}</h1>

      </main>
    </div>
  );
}

Me.getInitialProps = async (ctx) => {
  const { accessToken } = ctx.query;
  const meResponse = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });
  const meJson = await meResponse.json();

  const tracksResponse = await fetch("https://api.spotify.com/v1/me/tracks", {
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });
  const tracksJson = await tracksResponse.json()
  return {...meJson, ...tracksJson}
};

export default Me;
