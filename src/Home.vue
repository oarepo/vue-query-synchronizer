<template>
    <div class="home">
        <br>
        Write anything here and watch the addressbar. Later <a href="/">reload the application</a>
        to see that the default value in the first field was taken from the local storage.<br><br>
        <table>
            <tr>
                <td>
                    Field stored to the local storage:
                </td>
                <td>
                    <input v-model="$query.search"><br><br>
                </td>
            </tr>
            <tr>
                <td>
                    Simple text field
                </td>
                <td>
                    <input v-model="$query.search2"><br><br>
                </td>
            </tr>
            <tr>
                <td>
                    Number field with the default value of 10:
                </td>
                <td>
                    <input type="number" v-model="$query.num"><br><br>
                </td>
            </tr>
            <tr>
                <td>
                    Checkbox:
                </td>
                <td>
                    <input type="checkbox" v-model="$query.check"><br><br>
                </td>
            </tr>
            <tr>
                <td>
                    Array (multiple selection, control-click for selecting both values):
                </td>
                <td>
                    <select multiple v-model="$query.option">
                        <option value="first">First choice</option>
                        <option value="second">Second choice</option>
                    </select><br><br>
                </td>
            </tr>
        </table>
        <br><br>
        Another property from router, not affected by the addressbar: <code>{{ another }}</code><br><br>
        query equals:
        <pre>{{ $rawQuery }}</pre>
    </div>
</template>

<script>

export default {
    name: 'home',
    components: {},
    props: {
        another: String
    },
    mounted () {
        // this.$query['check'] = true
    }
}
</script>
