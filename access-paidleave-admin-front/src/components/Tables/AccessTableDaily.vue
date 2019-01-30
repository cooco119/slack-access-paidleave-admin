<template>
  <div>
    <md-table v-model="users" :table-header-color="tableHeaderColor">
      <md-table-row slot="md-table-row" slot-scope="{ item }">
        <md-table-cell md-label="이름">{{ item.name }}</md-table-cell>
        <md-table-cell md-label="일시">{{ item.date }}</md-table-cell>
        <md-table-cell md-label="총 근무 시간">{{ item.duration }}</md-table-cell>
        <md-table-cell md-label="출근 시간">{{ item.attend }}</md-table-cell>
        <md-table-cell md-label="퇴근 시간">{{ item.goHome }}</md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</template>

<script>
export default {
  name: "access-table-daily",
  props: {
    tableHeaderColor: {
      type: String,
      default: ""
    },
    tableData: {
      type: Object,
      default: [
        {
          name: "이름",
          date: "일시",
          duration: "duration",
          attend: "attend",
          goHome: "goHome"
        }
      ]
    }
  },
  updated: function () {
    this.users = this.props.tableData;
    console.log(this.users);
  },
  data() {
    return {
      selected: [],
      users: []
    };
  }
};
</script>
