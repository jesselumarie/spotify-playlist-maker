import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import {
  AUTH_DATA_KEY,
  ACCESS_TOKEN,
  TOKEN_TYPE,
  EXPIRES_IN,
} from "../constants/storage";

export default function CallbackHandler() {
  const router = useRouter();
  let urlParams = new URLSearchParams("");
  let hash = "";

  if (process.browser) {
    hash = window.location.hash;
    const queryParams = `?${hash.split("#")[1]}`;
    urlParams = new URLSearchParams(queryParams);

    const localData = localStorage.getItem(AUTH_DATA_KEY);
    console.log(localData)
    const authData = (localData && JSON.parse(localData)) || {};

    authData[ACCESS_TOKEN] = urlParams.get("access_token");
    authData[TOKEN_TYPE] = urlParams.get("token_type");
    authData[EXPIRES_IN] = urlParams.get("expires_in");

    localStorage.setItem(AUTH_DATA_KEY, JSON.stringify(authData));

    router.push(`/select/?accessToken=${urlParams.get("access_token")}`);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Spotify callback handler</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}></main>
    </div>
  );
}
