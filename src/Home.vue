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
            <tr>
                <td>
                    Comma-separated array (multiple selection, control-click for selecting both values):
                </td>
                <td>
                    <select multiple v-model="$query.option2">
                        <option value="first">First choice</option>
                        <option value="second">Second choice</option>
                    </select><br><br>
                </td>
            </tr>
            <tr>
                <td>
                    Space-separated array (multiple selection, control-click for selecting both values):
                </td>
                <td>
                    <select multiple v-model="$query.option3">
                        <option value="first">First choice</option>
                        <option value="second">Second choice</option>
                    </select><br><br>
                </td>
            </tr>
            <tr>
                <td>
                    Add and remove (the query param is called dynarr):
                </td>
                <td>
                    <input v-model="tmp" placeholder="Enter value"><br><br>
                    <button @click="$query.addValue('dynarr', tmp)">Add</button>&nbsp;
                    <button @click="$query.removeValue('dynarr', tmp)">Remove</button>
                    <br>
                </td>
            </tr>
        </table>
        <br><br>
        <button @click="convert">Convert simple text field to numeric model (can be used to, for example, define
            datatype later)
        </button>
        <br><br>
        query equals:
        <pre>{{ rawQuery }}</pre>
        own keys:
        <pre>
            {{ currentKeys }}
        </pre>
        stringified query:
        <pre>
            {{ JSON.stringify($query, null, 4) }}
        </pre>
    </div>
</template>

<script>

import { IntDatatype, CommaArrayDatatype } from '@oarepo/vue-query-synchronizer'

export default {
    name: 'home',
    components: {},
    props: {
        another: String
    },
    data: function () {
        return {
            tmp: '',
            currentKeys: []
        }
    },
    mounted() {
        this.$query.define('dynarr', CommaArrayDatatype, [])
        this.currentKeys = Object.getOwnPropertyNames(this.$query)
        console.log(this.currentKeys, JSON.stringify(this.$query))
    },
    methods: {
        convert() {
            this.$query.define('search2', IntDatatype)
        }
    },
    computed: {
        rawQuery() {
            return this.$rawQuery
        }
    },
    watches: {
        rawQuery: {
            deep: true,
            handler: () => {
                console.log('current keys called with', this.$query)
                this.currentKeys = Object.getOwnPropertyNames(this.$query)
            }
        }
    }
}
</script>
