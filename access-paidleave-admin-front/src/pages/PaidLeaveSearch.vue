<template>
  <div class="content">
    <div class="md-layout"><md-card>
        <md-card-content>
        <h5 class="title">조회할 이름 입력</h5>
        <md-field>
          <label>이름</label>
          <md-input v-model="name" v-on:keydown.enter="submit" ></md-input>
        </md-field>
        </md-card-content>
        <md-card-content>
          <md-button v-on:click="submit" class="md-raised">확인</md-button>
        </md-card-content>
      </md-card>
      <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-100">
        <md-card class="md-card-plain">
          <md-card-header data-background-color="green">
            <h4 class="title">휴가 내역 조회 결과</h4>
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
            <md-button v-on:click="print" class="md-raised" v-show="show_download">다운로드</md-button>     
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
    table_data: [],
    show_download: false
  }),
  components: {
    PaidleaveTable
  },
  methods: {
    submit: function() {
      const url_prefix = "http://192.168.101.198/api/v1";
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
        credentials: "include",
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=utf-8",
          "Accept": "application/json"
        }
      }).then( async res => {
        if (res.status === 200){
          let tmp = await res.json();
          const tmp2 = { ...tmp};
          console.log(tmp2);
          if (tmp2.exists){
            for (let i = 0; i < tmp2.message.length; i++){
              self.table_data.push(tmp2.message[i]);
            }
          }
          console.log(self.table_data);
          this.show_download = true;
        }
        else if (res.status === 401) {
          alert("조회하려면 로그인이 필요합니다.");
          this.$router.push({name: '로그인'});
        }
        else {
          alert("에러 발생\n" + `내용: ${res.json()}`);
        }
      })
    },
    print: function (event) {
      console.log("csv print function");
      let data, csv, title;
      data = this.table_data;
      csv = '"이름","해당일시","종류","누적"\n';
      for (let i = 0; i < data.length; i++ ){
        csv += `"${data[i].name}",`;
        csv += `"${data[i].date}",`;
        csv += `"${data[i].type}",`;
        csv += `"${data[i].cummulate}"\n`;
      }
      title = `연차조회_전체_${data[0].name}.csv`;
      console.log(csv);
      let hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
      hiddenElement.target = '_blank';
      hiddenElement.download = title;
      hiddenElement.click();
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
