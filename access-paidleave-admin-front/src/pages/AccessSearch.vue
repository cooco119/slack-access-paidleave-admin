<template>
  <div class="content">
    <div class="md-layout">
      <md-card>
        <md-card-content>
        <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-100">
          <label style="font-size: 18px">조회 기간: &nbsp; &nbsp; &nbsp;</label>
          <md-datepicker v-model="start">
            <label>시작</label>
          </md-datepicker>
          <md-datepicker v-model="end">
            <label>종료</label>
          </md-datepicker>
        </div>
        <div style="padding: 10px" />
        <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-100">
          <label style="font-size: 18px">조회할 이름: &nbsp; &nbsp; &nbsp;</label>
          <md-field>
            <label>이름</label>
            <md-input v-model="name" v-on:keydown.enter="submit" ></md-input>
          </md-field>
        </div>
        </md-card-content>
        <md-card-content>
          <md-button v-on:click="submit" class="md-raised">확인</md-button>
        </md-card-content>
      </md-card>
      <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-100">
        <md-card class="md-card-plain">
          <md-card-header data-background-color="green">
            <h4 class="title">출입 기록 조회 결과</h4>
          </md-card-header>
          <md-card-content>
            <div>
              <md-table v-model="table_data">
                <md-table-row slot="md-table-row" slot-scope="{ item }">
                  <md-table-cell md-label="이름">{{ item.name }}</md-table-cell>
                  <md-table-cell md-label="일시">{{ item.date }}</md-table-cell>
                  <md-table-cell md-label="종류">{{ item.type }}</md-table-cell>
                  <md-table-cell md-label="">
                    <div class="md-collapse">
                      <md-layout>
                        <md-layout-item class="md-column md-button md-icon-button" style="text-align: center; height: 30px" @click="modify">
                          <md-icon class="material-icons">create</md-icon>
                        </md-layout-item>
                        <md-layout-item style="padding: 5px"/>
                        <md-layout-item class="md-column md-button md-icon-button" style="text-align: center; height: 30px" @click="remove">
                          <md-icon class="material-icons">clear</md-icon>
                        </md-layout-item>
                      </md-layout>
                    </div>
                  </md-table-cell>
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
const queryString = require('query-string');

export default {
  data: () => ({
    start: null,
    end: null,
    name: null,
    show_download: false,
    table_data: []
  }),
  methods: {
    submit: function (event){
      const url_prefix = "http://192.168.101.198/api/v1/history/access?";
      let url;
      let self = this;
      let data = {
        "start": this.start.getTime(),
        "end": this.end.getTime(),
        "name": this.name
      }
      url = url_prefix + queryString.stringify(data);
      fetch(url, {
        method: 'GET',
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "content-type": "application/x-www-form-urlencoded; charset=utf-8"
        }
      }).then( async res => {
        if (res.status === 200){
          let resData = await res.json();
          console.log(resData);
          resData.data.forEach(element => {
            self.table_data.push(element);
          });
          console.log(self.table_data);
          self.show_download = true;
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
      csv = '"이름","일시","종류"\n';
      for (let i = 0; i < data.length; i++ ){
        csv += `"${data[i].name}",`;
        csv += `"${data[i].date}",`;
        csv += `"${data[i].type}"\n`;
      }
      title = `출입기록조회_${data[0].name}.csv`;
      
      console.log(csv);
      let hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
      hiddenElement.target = '_blank';
      hiddenElement.download = title;
      hiddenElement.click();
    },
    modify: function () {

    },
    remove: function() {

    }
  },
  computed: {
  }
};
</script>
