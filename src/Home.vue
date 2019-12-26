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
        <tr>
            <td>
                Number field with the default value of 10:
            </td>
            <td>
                <input type="number" v-model="query.num"><br><br>
            </td>
        </tr>
        <tr>
            <td>
                Checkbox:
            </td>
            <td>
                <input type="checkbox" v-model="query.check"><br><br>
            </td>
        </tr>
        <tr>
            <td>
                Array (multiple selection, control-click for selecting both values):
            </td>
            <td>
                <select multiple v-model="query.option">
                    <option value="first">First choice</option>
                    <option value="second">Second choice</option>
                </select><br><br>
            </td>
        </tr>
    </table>
    <br><br>
    Another property from router, not affected by the addressbar: <code>{{ another }}</code><br><br>
    Query prop contains:
    <pre>{{stringifiedQuery}}</pre>
</div>
</template>

<script>

export default {
    name: 'home',
    components: {},
    props: {
        query: Object,
        another: String
    },
    computed: {
        stringifiedQuery () {
            var cache = []
            const ret = JSON.stringify(this.query, function (key, value) {
                if (typeof value === 'object' && value !== null) {
                    if (cache.indexOf(value) !== -1) {
                        // Circular reference found, discard key
                        return '-> ../' + key
                    }
                    // Store value in our collection
                    cache.push(value)
                }
                return value
            }, 4)
            cache = null
            return ret
        }
    }
}
</script>
