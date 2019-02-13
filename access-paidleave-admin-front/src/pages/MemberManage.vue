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
              <label>입사일</label>
              <md-input v-model="newData.date"></md-input>
            </md-field>
          </md-table-cell>
          <md-table-cell md-label="종류">
            <md-field>
              <label>연락처</label>
              <md-input v-model="newData.contact"></md-input>
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
      <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-100">
        <md-card class="md-card-plain">
          <md-card-header data-background-color="green">
            <h4 class="title">직원 내역</h4>
          </md-card-header>
          <md-card-content>
            <div class="md-layout">
              <div class="md-layout-item md-column">
              </div>
              <div class="md-layout-item md-column md-size-25">
              <md-button v-on:click="print" class="md-raised" v-show="show_download">다운로드</md-button>
              </div>
            </div>
            <div>
              <md-table v-model="table_data">
                <md-table-row slot="md-table-row" slot-scope="{ item }">
                  <md-table-cell md-label="이름">{{ item.name }}</md-table-cell>
                  <md-table-cell md-label="입사일">{{ item.date }}</md-table-cell>
                  <md-table-cell md-label="근속 년수">{{ item.years }} 년차</md-table-cell>
                  <md-table-cell md-label="연락처">{{ item.contact }}</md-table-cell>
                  <md-table-cell md-label="수정/삭제">
                    <div class="md-collapse">
                      <div class="md-layout">
                        <div class="md-layout-item md-column md-button md-icon-button" style="text-align: center; height: 30px" @click="showModal('modify', item.name, item.date, item.contact)">
                          <md-icon class="material-icons">create</md-icon>
                        </div>
                        <div class="md-layout-item" style="padding: 5px"/>
                        <div class="md-layout-item md-column md-button md-icon-button" style="text-align: center; height: 30px" @click="remove(item.name, item.date, item.contact)">
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
import { PaidleaveTable } from "@/components";
const queryString = require('query-string');

export default {
  data: () => ({
    show_download: false,
    oldData: {
      name: null,
      date: null,
      contact: null,
    },
    newData: {
      name: null,
      date: null,
      contact: null
    },
    table_data: []
  }),
  components: {
    PaidleaveTable
  },
  methods: {
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
    },
    showModal: function (scope, name, date, contact){
      this.oldData.name = this.newData.name = name;
      this.oldData.date = this.newData.date = date;
      this.oldData.contact = this.newData.contact = contact;
      
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
      const url = "http://192.168.0.162:81/api/v1/history/modify";

      let data = {
        "scope": "members",
        "ref" : this.oldData,
        "new" : this.newData
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
          alert("기록 수정 성공");
          this.getData();
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
    remove: function (name, date, contact) {
      const check = confirm("다음 내용을 삭제하시겠습니까?\n" + 
                            `- 이름: ${name}\n` +
                            `- 일시: ${date}\n` +
                            `- 종류: ${contact}`);
      if (!check) {
        alert("취소하였습니다.");
        return;
      }
      
      const url = "http://192.168.0.162:81/api/v1/history/remove";
      let data = {
        "scope": "members",
        "ref": {
          "name": name,
          "date": date,
          "contact": contact
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
          this.getData();
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
    },
    getData: function () {
      let data = [];
      let url = "http://192.168.0.162:81/api/v1/members";

      fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      }).then( async res => {
        if (res.status === 200){
          let resData = await res.json();
          console.log(resData);
          this.table_data = resData.data;
          this.show_download = true;
        }
        else if (res.status === 401) {
          alert("조회하려면 로그인이 필요합니다.");
          this.$router.push({name: '로그인'});
        }
        else {
          alert("에러 발생\n" + `내용: ${res.json()}`);
        }
      }).catch( e => {
        console.log(e);
        alert("네트워크 에러, 새로고침 해주세요.");
      });
    }
  },
  beforeMount(){
    this.getData();
  },
  computed: {
    years: function (){
      let arr = [];
      let curYear = (new Date(2015,0,1)).getFullYear();
      for (let i = curYear; i <= (new Date()).getFullYear(); i++){
        arr.push(i);
      }
      return arr;
    },
    curYear: function() {
      if (this.start !== null) return this.start.getFullYear();
      return null;
    }
  }

};
</script>
