import Head from "next/head";
import styles from "../styles/Home.module.css";
import { LogInButton } from "../components/login";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Zip Playlist ⚡️</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Zip Playlist ⚡️</h1>

        <LogInButton />
      </main>
    </div>
  );
}
