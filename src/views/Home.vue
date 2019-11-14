<template>
<div class="home">
  <br>
  Write anything here and watch the addressbar:<br>
  <input :value="query.search" v-on="{input: $updateQuery('search')}"><br><br>
  <input :value="query.search2" v-on="{input: $updateQuery('search2')}"><br><br>
  Another property from router, not affected by the addressbar: {{ another }}
</div>
</template>

<script>

export default {
  name: 'home',
  components: {},
  props: {
    query: Object,
    another: String
  }
}
</script>
