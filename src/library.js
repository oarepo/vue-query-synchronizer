function queryProp (params, extraProps) {
  /*
      @param: params: all the parameters present in path. If not there, will be filled with null
      to be watchable
      @param: extraProps: dictionary of extra properties
   */
  function maker (route) {
    console.log('updating props on query change ...', route.query)
    const nullParams = {}
    for (const key of params) {
      nullParams[key] = null
    }
    return {
      ...extraProps,
      query: {
        ...nullParams,
        ...route.query
      }
    }
  }

  return maker
}

export { queryProp }

export default {
  install (Vue, options) {
    if (!options) {
      options = {}
    }
    console.log('adding $updateQuery')
    Vue.prototype.$updateQuery = function (propName) {
      console.log(`updateQuery instantiated with ${propName}`)
      const self = this
      return function (event) {
        const target = event.target
        if (target && target.value !== undefined) {
          self.$router.push({ query: { ...self.$route.query, [propName]: target.value } })
        } else {
          this.$router.push({ query: { ...self.$route.query, [propName]: event } })
        }
      }
      //
    }
  }
}
