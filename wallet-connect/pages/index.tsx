import { NextPage } from 'next'
import { AppBar } from '../components/AppBar'
import { SendSolTo } from '../components/SendSolTo'
import { BalanceDisplay } from '../components/BalanceDisplay'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

const Home: NextPage = (props) => {

  return (
    <div className={styles.App}>
      <Head>
        <title>Wallet-Adapter Example</title>
        <meta
          name="description"
          content="Wallet-Adapter Example"
        />
      </Head>
        <AppBar />
        <div className={styles.AppBody}>
          {/* <PingButton/> */}
          <BalanceDisplay />
          <SendSolTo/>
        </div>
    </div>
  );
}

export default Home;