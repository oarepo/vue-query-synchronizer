<template>
  <div style="display: flex; flex-direction: row; justify-content: space-around">
    <div style="max-width: 600px">
      <h1>Sample application</h1>
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
</style>
