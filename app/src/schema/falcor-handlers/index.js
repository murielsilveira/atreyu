// TODO: warn Observable handlers cannot be async functions themselves
// TODO: filter out changes of own set/ call operations
function userDb (dbs) {
  return dbs.entries().next().value?.[1]
}

export const _sync = ({ dbs, Observable }, [ since ]) => {
  return Observable.create(subscriber => {
    const changes = userDb(dbs).changes({
      since: since || 'now',
      live: true,
      include_docs: true
    })
    .on('change', change => {
      // { "changes": [ { "rev": "2-f0473cbda03b" } ] }
      // console.log('falcor handler', change) // todo: debug realms with client side flags

      subscriber.onNext({ path: ['_seq'], value: {$type: 'atom', value: change.seq} })
      subscriber.onNext({ path: ['_docs', change.id], value: {$type: 'atom', value: change.doc} })
      subscriber.onCompleted() // TODO: fix router to forward before complete for long running observable!
    })
    .on('error', err => {
      subscriber.onError({ $type: 'error', value: err })
    })

    // .on('complete', function(info) {
    //   subscriber.onCompleted()
    // })

    return () => {
      changes.cancel()
    }
  })
}