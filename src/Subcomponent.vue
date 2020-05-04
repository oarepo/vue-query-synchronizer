<template>
<div class="subcomponent">
    Subcomponent gets the following query:
    <pre>{{query.json}}</pre>
    Single field: {{ query.search }}
    <input v-model="query.search">
    <br>
    Setter for previously unknown query parameter 'z': <input v-model="query.z">
</div>
</template>

<script>

export default {
    name: 'home',
    components: {},
    props: {
        query: Object
    },
    mounted () {
        this.query._prop('z')
    }
}
</script>
