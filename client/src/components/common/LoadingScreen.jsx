import styles from './LoadingScreen.module.css'

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        <div className={styles.logoMark}>TB</div>
        <div className={styles.brand}>
          <span className={styles.trans}>TRANS</span>
          <span className={styles.bridge}>BRIDGE</span>
        </div>
        <div className={styles.barWrap}>
          <div className={styles.bar} />
        </div>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  )
}
