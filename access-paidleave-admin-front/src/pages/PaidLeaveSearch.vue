<template>
  <div class="content">
    <div class="md-layout"><md-card>
        <md-card-content>
        <h5 class="title">조회할 이름 입력</h5>
        <md-field>
          <label>이름</label>
          <md-input v-model="name"></md-input>
        </md-field>
        </md-card-content>
        <md-card-content>
          <md-button v-on:click="submit" class="md-raised">확인</md-button>
        </md-card-content>
      </md-card>
      <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-100">
        <md-card class="md-card-plain">
          <md-card-header data-background-color="green">
            <h4 class="title">연차 조회 결과</h4>
          </md-card-header>
          <md-card-content>
            <div>
              <md-table v-model="table_data">
                <md-table-row slot="md-table-row" slot-scope="{ item }">
                  <md-table-cell md-label="이름">{{ item.name }}</md-table-cell>
                  <md-table-cell md-label="해당일시">{{ item.date }}</md-table-cell>
                  <md-table-cell md-label="종류">{{ item.type }}</md-table-cell>
                  <md-table-cell md-label="누적">{{ item.cummulate }}</md-table-cell>
                </md-table-row>
              </md-table>
            </div>
          </md-card-content>
        </md-card>
      </div>
    </div>
  </div>
</template>

<script>
import { PaidleaveTable } from "@/components";
const queryString = require('query-string');

export default {
  data: () => ({
    name: null,
    table_data: []
  }),
  components: {
    PaidleaveTable
  },
  methods: {
    submit: function() {
      const url_prefix = "http://c063c4f4.ngrok.io/api/v1";
      let url;
      let self = this;
      this.table_data = [];
      url = url_prefix + '/paidleave?';
      let date = this.select_weekly_year + '-' + this.select_weekly_month + '-' + this.select_weekly_week;
      let result = {
        "name": this.name
      };
      url = url + queryString.stringify(result);
      console.log(url);
      fetch(url, {
        method: 'GET',
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=utf-8",
          "Accept": "application/json"
        }
      }).then( async res => {
        let tmp = await res.json();
        const tmp2 = { ...tmp};
        console.log(tmp2);
        if (tmp2.exists){
          for (let i = 0; i < tmp2.message.length; i++){
            self.table_data.push(tmp2.message[i]);
          }
        }
        console.log(self.table_data);
      })
    }
  },
  computed: {
    years: function (){
      let arr = [];
      let curYear = (new Date(2015,0,1)).getFullYear();
      for (let i = curYear; i <= (new Date()).getFullYear(); i++){
        arr.push(i);
      }
      return arr;
    }
  }
};
</script>
