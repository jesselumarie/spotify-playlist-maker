import Head from 'next/head'
import styles from '../../styles/Home.module.css'

export default function About() {
  return (
    <div className={styles.container}>
      <Head>
        <title>About page</title>
      </Head>
      <main className={styles.main}>
        <h1>Mai about page</h1>
      </main>
    </div>
  )
}
