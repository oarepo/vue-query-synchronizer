# @oarepo/vue-query-synchronizer

In browser applications, address bar should be the most important source
of truth. When user performs data filtering, sorting, ..., the url should
change so that the result of the filtering is bookmarkable/shareable.

Traditionally vue component would listen on query change and copy the
query params to an internal model. This would be then used by an input
component. Whenever the input is changed, an event listener (after optional
debouncing) would propagate the change back to the query.

This library does all of this on the background, leaving you with just
a couple of lines of code.

## Installation
```
yarn add @oarepo/vue-query-synchronizer
```

## Usage

### Plugin installation

Add the following to ``main.js`` (in quasar ``boot/....js``)

```javascript
import QuerySupport from '@oarepo/vue-query-synchronizer'

Vue.use(QuerySupport, {
    router: router
})
```
See [src/main.js](src/main.js) for the whole file.

### Router configuration

In router configuration, mark which query parameters should be synchronized
with the component state:

```javascript
import { query } from '@oarepo/vue-query-synchronizer'

const routes = [
{
    path: '/',
    name: 'home',
    props: query(['filter', 'sort']),
    component: Home
}
]
```
Full example at [src/router.js](src/router.js)

### Component

In component, do not forget to add ``query`` to component's ``props``. Then
you can use ``query.filter``, ``query.sort`` as normal models for
html inputs or as models for any other components:

```vue
<template>
<div>
    <input v-model="query.filter"><br><br>
    <pre>{{query}}</pre>
</div>
</template>

<script>
export default {
    name: 'home',
    props: {
        query: Object,
    }
}
</script>
```
Full example at [src/Home.vue](src/Home.vue)

## Demo setup and run
```
yarn install
yarn run serve
```

## Library build
```
yarn run build
```

## API

### ``QuerySupport`` plugin configuration

During plugin registration, ``router`` must be passed in. Optionally
a global ``debounce`` can be set, the default if unset is 100ms. 

```javascript
import QuerySupport from '@oarepo/vue-query-synchronizer'

Vue.use(QuerySupport, {
    router: router,
    debounce: 100
})
```

### ``query(paramsList, extraParams?)``

``paramsList`` is a list of query parameters that should be captured
by the library and synchronized with the component. A member of the list
can be either string (as seen in the example above) or an object:

```javascript
{
    name: 'search',
    debounce: 1000
}
``` 
If the object defines ``debounce`` property, it will be used instead of the default
value.

Optional parameter ``extraParams`` contains any extra params 
that you would normally put directly under ``props``.
The parameter can be either an object or a function taking ``route`` and 
returning an object.


