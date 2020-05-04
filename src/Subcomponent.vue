<template>
<div class="subcomponent">
    Subcomponent gets the following query:
    <pre>{{stringifiedQuery}}</pre>
    Single field: {{ query.search }}
</div>
</template>

<script>

export default {
    name: 'home',
    components: {},
    props: {
        query: Object
    },
    computed: {
        stringifiedQuery () {
            return JSON.stringify(this.query, undefined, 4)
        }
    }
}
</script>
