<template>
<div class="home">
    <br>
    Write anything here and watch the addressbar:<br><br>
    <table>
        <tr>
            <td>
                Field with default debouncing of 100ms:
            </td>
            <td>
                <input v-model="query.search"><br><br>
            </td>
        </tr>
        <tr>
            <td>
                Field with custom debouncing of 1000ms:
            </td>
            <td>
                <input v-model="query.search2"><br><br>
            </td>
        </tr>
    </table>
    <br><br>
    Another property from router, not affected by the addressbar: <code>{{ another }}</code><br><br>
    Query prop contains:
    <pre>{{query}}</pre>
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
