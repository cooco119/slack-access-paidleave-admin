<template>
  <div>
    <md-table v-model="users" :table-header-color="tableHeaderColor">
      <md-table-row slot="md-table-row" slot-scope="{ item }">
        <md-table-cell md-label="이름">{{ item.id }}</md-table-cell>
        <md-table-cell md-label="해당일시">{{ item.name }}</md-table-cell>
        <md-table-cell md-label="종류">{{ item.salary }}</md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</template>

<script>
export default {
  name: "paidleave-table",
  props: {
    tableHeaderColor: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      selected: [],
      users: [
        {
          id: 1,
          name: "Dakota Rice",
          salary: "$36,738",
        },
        {
          id: 2,
          name: "Minerva Hooper",
          salary: "$23,738",
        },
        {
          id: 3,
          name: "Sage Rodriguez",
          salary: "$56,142",
        },
        {
          id: 4,
          name: "Philip Chaney",
          salary: "$38,735",
        }
      ]
    };
  }
};
</script>
