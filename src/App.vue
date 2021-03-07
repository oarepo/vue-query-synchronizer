<template>
  <div style="display: flex; flex-direction: row; justify-content: space-around">
    <div style="width: 600px; max-width: 90vw">
      <div class="toolbar">
        <router-link to="/" class="tab">Options-based view</router-link>
        <router-link to="/composition-api" class="tab right">Composition-api view</router-link>
      </div>
      <h1>Sample application</h1>
      <div style="width: 100%">

      </div>
      <router-view/>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useQuery } from '@oarepo/vue-query-synchronizer'

export default defineComponent({
  setup () {
    useQuery()
  }
})
</script>

<style>
body {
  font-family: 'Source Sans Pro', sans-serif;
}
.toolbar {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-variant: small-caps;
}

.toolbar .tab {
  flex-grow: 1;
  padding: 10px;
  text-align: center;
  text-decoration: none;
  color: black;
  border-bottom: 1px solid lightgrey;
}

.toolbar .tab.router-link-exact-active {
  border-bottom: 3px solid mediumpurple;
  color: mediumpurple;
}

.right {
}
</style>
