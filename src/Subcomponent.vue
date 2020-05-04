<template>
<div class="subcomponent">
    Subcomponent gets the following query:
    <pre>{{query.json}}</pre>
    Single field: {{ query.search }}
    <input v-model="query.search">
</div>
</template>

<script>

export default {
    name: 'home',
    components: {},
    props: {
        query: Object
    }
}
</script>
