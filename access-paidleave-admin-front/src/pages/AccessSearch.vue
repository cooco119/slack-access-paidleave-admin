<template>
  <div class="content">
    <modal width="800" name="modify">
      <div style="padding: 10px" />
      <h4 style="padding-left: 20px; padding-up: 50px" class="title">수정하기</h4>
      <md-table style="padding-left: 20px">
        <md-table-row slot="md-table-row">
          <md-table-cell md-label="이름">
            <md-field>
              <label>이름</label>
              <md-input v-model="newData.name"></md-input>
            </md-field>
          </md-table-cell>
          <md-table-cell md-label="일시">
            <md-field>
              <label>날짜</label>
              <md-input v-model="newData.date"></md-input>
            </md-field>
          </md-table-cell>
          <md-table-cell md-label="종류">
            <md-field>
              <label>종류</label>
              <md-input v-model="newData.type"></md-input>
            </md-field>
          </md-table-cell>
        </md-table-row>
      </md-table>
      <div style="padding: 20px" />
      <div class="md-layout">
        <div class="md-layout-item md-column" style="width: 400px">
        </div>
        <div class="md-layout-item md-column md-size-15">
          <md-button class="md-accent" @click="closeModal">
            취소
          </md-button>
        </div>
        <div class="md-layout-item md-column md-size-15">
          <md-button class="md-primary" @click="modify">
            확인
          </md-button>
        </div>
      </div>
    </modal>
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
            <div class="md-layout">
              <div class="md-layout-item md-column">
              <h4 v-show="show_download">조회 내역</h4>
              </div>
              <div class="md-layout-item md-column md-size-25">
              <md-button v-on:click="print" class="md-raised" v-show="show_download">다운로드</md-button>
              </div>
            </div>
            <div>
              <md-table v-model="table_data">
                <md-table-row slot="md-table-row" slot-scope="{ item }">
                  <md-table-cell md-label="이름">{{ item.name }}</md-table-cell>
                  <md-table-cell md-label="일시">{{ item.date }}</md-table-cell>
                  <md-table-cell md-label="종류">{{ item.type }}</md-table-cell>
                  <md-table-cell md-label="수정/삭제">
                    <div class="md-collapse">
                      <div class="md-layout">
                        <div class="md-layout-item md-column md-button md-icon-button" style="text-align: center; height: 30px" @click="showModal('modify', item.name, item.date, item.type)">
                          <md-icon class="material-icons">create</md-icon>
                        </div>
                        <div class="md-layout-item" style="padding: 5px"/>
                        <div class="md-layout-item md-column md-button md-icon-button" style="text-align: center; height: 30px" @click="remove(item.name, item.date, item.type)">
                          <md-icon class="material-icons">clear</md-icon>
                        </div>
                      </div>
                    </div>
                  </md-table-cell>
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
const queryString = require('query-string');

export default {
  data: () => ({
    start: null,
    end: null,
    name: null,
    show_download: false,
    table_data: [],
    scope: null,
    oldData: {
      name: null,
      date: null,
      type: null,
    },
    newData: {
      name: null,
      date: null,
      type: null
    }
  }),
  methods: {
    submit: function (event){
      const url_prefix = "http://192.168.0.162/api/v1/history/access?";
      let url;
      this.table_data = [];
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
    showModal: function (scope, name, date, type){
      this.oldData.name = this.newData.name = name;
      this.oldData.date = this.newData.date = date;
      this.oldData.type = this.newData.type = type;
      
      this.$modal.show(scope);

      return;
    },
    closeModal: function () {
      this.$modal.hide('modify');
      this.$modal.hide('remove');
    },
    modify: function () {
      const check = confirm("수정하시겠습니까?");
      if (!check) {
        alert("취소하였습니다.");
        return;
      }
      const url = "http://192.168.0.162/api/v1/history/modify";
      let year, month, day, time, hour, minute, second;
      [year, month, day, time] = this.oldData.date.split(' ');
      year = parseInt(year.substring(0, year.length - 1));
      month = parseInt(month.substring(0, month.length - 1)) - 1;
      day = parseInt(day.substring(0, day.length - 1));

      [hour, minute, second] = time.split('-');
      hour = parseInt(hour);
      minute = parseInt(minute);
      second = parseInt(second);
      this.oldData.date = (new Date(year, month, day, hour, minute, second)).getTime();
      [year, month, day, time] = this.newData.date.split(' ');
      year = parseInt(year.substring(0, year.length - 1));
      month = parseInt(month.substring(0, month.length - 1)) - 1;
      day = parseInt(day.substring(0, day.length - 1));

      [hour, minute, second] = time.split('-');
      hour = parseInt(hour);
      minute = parseInt(minute);
      second = parseInt(second);
      this.newData.date = (new Date(year, month, day, hour, minute, second)).getTime();
      let data = {
        "scope": "access",
        "ref" : this.oldData,
        "new" : this.newData
      };
      console.log("data.ref.name: ", data.ref.name);
      fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      }).then( res => {
        if (res.status === 200){
          let resData = res.json();
          console.log(resData);
          alert("기록 수정 성공");
          this.submit();
        }
        else if (res.status === 401) {
          alert("수정하려면 로그인이 필요합니다.");
          this.$router.push({name: '로그인'});
        }
        else {
          alert("에러 발생\n" + `내용: ${res.json()}`);
        }
      }).catch( e => {
        console.log(e);
        alert("네트워크 에러, 다시 시도해주세요.");
      })
      this.closeModal();
    },
    remove: function (name, date, type) {
      const check = confirm("다음 내용을 삭제하시겠습니까?\n" + 
                            `- 이름: ${name}\n` +
                            `- 일시: ${date}\n` +
                            `- 종류: ${type}`);
      if (!check) {
        alert("취소하였습니다.");
        return;
      }
      let year, month, day, time, hour, minute, second;
      [year, month, day, time] = date.split(' ');
      year = parseInt(year.substring(0, year.length - 1));
      month = parseInt(month.substring(0, month.length - 1)) - 1;
      day = parseInt(day.substring(0, day.length - 1));

      [hour, minute, second] = time.split('-');
      hour = parseInt(hour);
      minute = parseInt(minute);
      second = parseInt(second);

      console.log((new Date(year, month, day, hour, minute, second)).getTime());
      const url = "http://192.168.0.162/api/v1/history/remove";
      let data = {
        "scope": "access",
        "ref": {
          "name": name,
          "date": (new Date(year, month, day, hour, minute, second)).getTime(),
          "type": type
        }
      };
      fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      }).then( res => {
        if (res.status === 200){
          let resData = res.json();
          console.log(resData);
          alert("기록 삭제 성공");
          this.submit();
        }
        else if (res.status === 401) {
          alert("삭제하려면 로그인이 필요합니다.");
          this.$router.push({name: '로그인'});
        }
        else {
          alert("에러 발생\n" + `내용: ${res.json()}`);
        }
      }).catch( e => {
        console.log(e);
        alert("네트워크 에러, 다시 시도해주세요.");
      });
    }
  },
  computed: {
  }
};
</script>
