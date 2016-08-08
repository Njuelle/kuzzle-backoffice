import kuzzle from '../../../services/kuzzle'
import Promise from 'bluebird'
import {
  RECEIVE_MAPPING,
  RECEIVE_INDEXES_COLLECTIONS,
  RECEIVE_COLLECTIONS,
  ADD_INDEX
} from './mutation-types'

const addLocalRealtimeCollections = (result, index) => {
  // eslint-disable-next-line no-undef
  let realtimeCollections = JSON.parse(localStorage.getItem('realtimeCollections') || '[]')

  realtimeCollections = realtimeCollections
    .filter(o => {
      return o.index === index
    }).map(o => {
      return o.collection
    })

  if (!result.realtime) {
    result.realtime = []
  }

  result.realtime.push(...realtimeCollections)
}

export const listIndexesAndCollections = (store) => {
  let promises = []
  // let currentIndex

  kuzzle
    .listIndexes((error, result) => {
      let indexesAndCollections = []

      if (error) {
        return
      }

      result.forEach((index) => {
        let promise = new Promise((resolve, reject) => {
          kuzzle.listCollections(index, (error, result) => {
            if (error && index !== '%kuzzle') {
              reject(new Error(error.message))
              return
            }
            if (index !== '%kuzzle') {
              addLocalRealtimeCollections(result, index)

              indexesAndCollections.push({
                name: index,
                collections: result
              })
            }
            resolve(indexesAndCollections)
          })
        })
        promises.push(promise)
      })
      Promise.all(promises).then(res => {
        store.dispatch(RECEIVE_INDEXES_COLLECTIONS, res[0])
      }).catch(() => {
        return
      })
    })
}

export const getMapping = (store, index, collection) => {
  kuzzle.dataCollectionFactory(collection, index).getMapping((err, res) => {
    if (err) {
      return
    }
    store.dispatch(RECEIVE_MAPPING, res.mapping)
  })
}

export const getCollectionsFromIndex = (store, index) => {
  kuzzle.listCollections(index, (err, result) => {
    if (err) {
      return
    }
    addLocalRealtimeCollections(result, index)
    store.dispatch(RECEIVE_COLLECTIONS, result)
  })
}

export const createIndex = (store, index) => {
  return new Promise((resolve, reject) => {
    kuzzle.query({index: index, controller: 'admin', action: 'createIndex'}, {}, (err) => {
      if (err) {
        return reject(new Error(err.message))
      }

      store.dispatch(ADD_INDEX, index)
      resolve()
    })
  })
}
