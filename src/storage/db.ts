import localforage from 'localforage'

const db = localforage.createInstance({
  name: 'zhudi-app',
  storeName: 'main'
})

export default db
