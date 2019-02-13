<template>
  <div class="content">
    <div class="md-layout">
      <md-card>
        <md-card-content>
        <h5 class="title">조회 범위 설정하기</h5>
        <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-100">
          <md-radio v-on:change="select" v-model="radio" value="daily">일별 조회</md-radio>
          <md-radio v-on:change="select" v-model="radio" value="weekly">주별 조회</md-radio>
          <md-radio v-on:change="select" v-model="radio" value="monthly">월별 조회</md-radio>
          <md-radio v-on:change="select" v-model="radio" value="intervalName">기간+이름별 조회</md-radio>
        </div>
        <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-100">
          <md-datepicker v-if="radio === 'daily'" v-model="select_daily">
            <label>날짜 선택</label>
          </md-datepicker>
          <div class="md-layout" v-if="radio === 'weekly'">
            <div class="md-layout-item">
              <md-field>
                <label for="year">연도</label>
                <md-select v-model="select_weekly_year" name="연도" id="year">
                  <md-option style="vertical-align: middle; line-height: 50px; padding-left: 10px" v-for="curYear in years" v-bind:value="curYear" v-bind:key="curYear">
                    {{curYear}}년
                  </md-option>
                </md-select>
              </md-field>
            </div>
            <div class="md-layout-item">
              <md-field>
                <label for="year">월</label>
                <md-select v-model="select_weekly_month" name="월" id="month">
                  <md-option style="line-height: 50px; padding-left: 10px" v-for="curMonth in 12" v-bind:value="curMonth" v-bind:key="curMonth">
                    {{curMonth}}월
                  </md-option>
                </md-select>
              </md-field>
            </div>
            <div class="md-layout-item">
              <md-field>
                <label for="year">주</label>
                <md-select v-model="select_weekly_week" name="주" id="week">
                  <md-option style="line-height: 50px; padding-left: 10px" v-for="curWeek in 5" v-bind:value="curWeek" v-bind:key="curWeek">
                    {{curWeek}}주
                  </md-option>
                </md-select>
              </md-field>
            </div>
          </div>
          <div class="md-layout" v-if="radio === 'monthly'">
            <div class="md-layout-item">
              <md-field>
                <label for="year">연도</label>
                <md-select v-model="select_monthly_year" name="연도" id="year">
                  <md-option style="line-height: 50px; padding-left: 10px" v-for="curYear in years" :value="curYear" :key="curYear">
                    {{curYear}}년
                  </md-option>
                </md-select>
              </md-field>
            </div>
            <div class="md-layout-item">
              <md-field>
                <label for="year">월</label>
                <md-select v-model="select_monthly_month" name="월" id="month">
                  <md-option style="line-height: 50px; padding-left: 10px" v-for="curMonth in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]" :value="curMonth" :key="curMonth">
                    {{curMonth}}월
                  </md-option>
                </md-select>
              </md-field>
            </div>
          </div>
          <div v-show="radio === 'intervalName'">
            <div style="padding: 10px" />
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
          </div>
        </div>
        </md-card-content>
        <md-card-content>
          <md-button v-on:click="submit" class="md-raised">확인</md-button>
        </md-card-content>
      </md-card>
      <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-100">
        <md-card class="md-card-plain">
          <md-card-header data-background-color="green">
            <h4 class="title">근무시간 조회 결과</h4>
          </md-card-header>
          <md-card-content>
            <md-button v-on:click="print" class="md-raised" v-show="show_download">다운로드</md-button>            
            <div v-show="radio === 'daily'">
              <md-table v-model="table_data_day">
                <md-table-row slot="md-table-row" slot-scope="{ item }" v-show="parseInt(item.duration) > 0">
                  <md-table-cell md-label="이름">{{ item.name }}</md-table-cell>
                  <md-table-cell md-label="일시">{{ item.date }}</md-table-cell>
                  <md-table-cell md-label="총 근무 시간">{{ item.duration }}</md-table-cell>
                  <md-table-cell md-label="출근 시간">{{ item.attend }}</md-table-cell>
                  <md-table-cell md-label="퇴근 시간">{{ item.goHome }}</md-table-cell>
                </md-table-row>
              </md-table>
            </div>
            <div v-show="radio === 'weekly'">
              <md-table v-model="table_data_week">
                <md-table-row slot="md-table-row" slot-scope="{ item }" v-show="parseInt(item.duration) > 0">
                  <md-table-cell md-label="이름">{{ item.name }}</md-table-cell>
                  <md-table-cell md-label="해당연월">{{ item.date }}</md-table-cell>
                  <md-table-cell md-label="해당 주">{{ item.week }}</md-table-cell>
                  <md-table-cell md-label="총 근무 시간">{{ item.duration }}</md-table-cell>
                </md-table-row>
              </md-table>
            </div>
            <div v-show="radio === 'monthly'">
              <md-table v-model="table_data_month" >
                <md-table-row slot="md-table-row" slot-scope="{ item }" v-show="parseInt(item.duration) > 0">
                  <md-table-cell md-label="이름">{{ item.name }}</md-table-cell>
                  <md-table-cell md-label="해당 연월">{{ item.date }}</md-table-cell>
                  <md-table-cell md-label="총 근무 시간">{{ item.duration }}</md-table-cell>
                </md-table-row>
              </md-table>
            </div>
            <div v-show="radio === 'intervalName'">
              <div v-show="submitted_intervalName">
                <label style="font-size: 20px;">{{name}}님 {{(start !== null) ? start.toLocaleDateString() : ''}} ~ {{end !== null ? end.toLocaleDateString() : ''}} 기간 조회 결과</label>
                <li>조회 기간 근무 가능 일수: {{intervalName_data.workDay}} 일</li>
                <li>총 근무 시간: {{intervalName_data.total}} 시간</li>
                <li>하루 평균 근무 시간: {{intervalName_data.avg}} 시간</li>
              </div>
            </div>
          </md-card-content>
        </md-card>
      </div>
    </div>
  </div>
</template>

<script>
import { AccessTableDaily, AccessTableWeekly, AccessTableMonthly } from "@/components";
const queryString = require('query-string');

export default {
  data: () => ({
    radio: "daily",
    select_daily: null,
    select_weekly_year: null,
    select_weekly_month: null,
    select_weekly_week: null,
    select_monthly_year: null,
    select_monthly_month: null,
    table_data_day: [],
    table_data_week: [],
    table_data_month: [],
    intervalName_data: [],
    submitted_daily: false,
    submitted_weekly: false,
    submitted_monthly: false,
    submitted_intervalName: false,
    show_download: false,
    start: null,
    end: null,
    name: null
  }),
  methods: {
    select: function (event){
      this.show_download = (this.radio==="daily" && this.submitted_daily) || (this.radio==="weekly" && this.submitted_weekly) || (this.radio==="monthly" && this.submitted_monthly) || (this.radio === "intervalName" && this.submitted_intervalName);
      return;
    },
    submit: function (event){
      const url_prefix = "http://192.168.0.162:81/api/v1";
      let url, date, scope = this.radio, result, response;
      let self = this;
      switch(this.radio){
        case "daily":
          this.table_data_day = [];
          url = url_prefix + '/access?';
          date = this.select_daily.getFullYear().toString() + '-' + (this.select_daily.getMonth() + 1).toString() + '-' + this.select_daily.getDate();
          result = {
            "scope": scope,
            "date": date
          };
          url = url + queryString.stringify(result);
          console.log(url);
          fetch(url, {
            method: 'GET',
            // mode: 'cors',
            headers: {
              "content-type": "application/x-www-form-urlencoded; charset=utf-8",
              "Accept": "application/json"
            },
            credentials: "include"
          }).then( async res => {
            if (res.status === 200){
              let tmp = await res.json();
              tmp = JSON.parse(JSON.stringify(tmp)); // for handle observer
              console.log(tmp.result[0]);
              for (let i = 0; i < tmp.result.length; i++){
                self.table_data_day.push(tmp.result[i]);
              }
              self.table_data_day.sort(self.compare);
              this.submitted_daily = true;
              console.log(self.table_data_day);
            }
            else if (res.status === 401) {
              alert("조회하려면 로그인이 필요합니다.");
              this.$router.push({name: '로그인'});
            }
            else {
              alert("에러 발생\n" + `내용: ${res.json()}`);
            }
            this.select();
          }).catch(e => console.log(e));
          break;
        case "weekly":
          this.table_data_week = [];
          url = url_prefix + '/access?';
          date = this.select_weekly_year + '-' + this.select_weekly_month + '-' + this.select_weekly_week;
          result = {
            "scope": scope,
            "date": date
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
              tmp = JSON.parse(JSON.stringify(tmp)); // for handle observer
              console.log(tmp.result);
              for (let i = 0; i < tmp.result.length; i++){
                self.table_data_week.push(tmp.result[i]);
              }
              self.table_data_week.sort(self.compare);
              console.log(self.table_data_week);
              this.submitted_weekly = true;
            }
            else if (res.status === 401) {
              alert("조회하려면 로그인이 필요합니다.");
              this.$router.push({name: '로그인'});
            }
            else {
              alert("에러 발생\n" + `내용: ${res.json()}`);
            }
            this.select();
          }).catch(e => console.log(e));
          break;
        case "monthly":
          this.table_data_month = [];
          url = url_prefix + '/access?';
          date = this.select_monthly_year + '-' + this.select_monthly_month;
          result = {
            "scope": scope,
            "date": date
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
              tmp = JSON.parse(JSON.stringify(tmp)); // for handle observer
              console.log(tmp.result[0]);
              for (let i = 0; i < tmp.result.length; i++){
                self.table_data_month.push(tmp.result[i]);
              }
              self.table_data_month.sort(self.compare);
              this.submitted_monthly = true;
              console.log(self.table_data_month);
            }
            else if (res.status === 401) {
              alert("조회하려면 로그인이 필요합니다.");
              this.$router.push({name: '로그인'});
            }
            else {
              alert("에러 발생\n" + `내용: ${res.json()}`);
            }
            this.select();
          }).catch(e => console.log(e));
          break;
        case "intervalName":
          this.intervalName_data = {};
          url = url_prefix + '/access?';
          result = {
            "scope": "intervalName",
            "start": this.start.getTime(),
            "end": this.end.getTime(),
            "name": this.name
          };
          url = url + queryString.stringify(result);
          fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
              "Accept": "applicaion/json",
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }).then( async res => {
            if (res.status === 200){
              let data = await res.json();
              data = JSON.parse(JSON.stringify(data)); // for handle observer
              this.intervalName_data = data.data;
              this.submitted_intervalName = true;
            }
            else if (res.status === 401) {
              alert("조회하려면 로그인이 필요합니다.");
              this.$router.push({name: '로그인'});
            }
            else {
              alert("에러 발생\n" + `내용: ${res.json()}`);
            }
            this.select();
          }).catch(e => console.log(e));

          break;
        default: 
          alert("에러, 정확한 입력 필요.");
          break;
      }


    },
    print: function (event) {
      console.log("csv print function");
      let data, csv, title;
      if (this.radio === "daily"){
        data = this.table_data_day;
        csv = '"이름","일시","총 근무 시간","출근 시간","퇴근 시간"\n';
        for (let i = 0; i < data.length; i++ ){
          if (parseInt(data[i].duration) > 0){
            csv += `"${data[i].name}",`;
            csv += `"${data[i].date}",`;
            csv += `"${data[i].duration}",`;
            csv += `"${data[i].attend}",`;
            csv += `"${data[i].goHome}"\n`;
          }
        }
        title = `일별조회_${data[0].date}.csv`;
      }
      else if (this.radio === "weekly"){
        data = this.table_data_week;
        csv = '"이름","해당연월","해당 주","총 근무 시간"\n';
        for (let i = 0; i < data.length; i++ ){
          if (parseInt(data[i].duration) > 0){
            csv += `"${data[i].name}",`;
            csv += `"${data[i].date}",`;
            csv += `"${data[i].week}",`;
            csv += `"${data[i].duration}"\n`;
          }
        }
        title = `주별조회_${data[0].date}.csv`;
      }
      else if (this.radio === "monthly"){
        data = this.table_data_month;
        csv = '"이름","해당 연월","총 근무 시간"\n';
        for (let i = 0; i < data.length; i++ ){
          if (parseInt(data[i].duration) > 0){
            csv += `"${data[i].name}",`;
            csv += `"${data[i].date}",`;
            csv += `"${data[i].duration}"\n`;
          }
        }
        title = `월별조회_${data[0].date}.csv`;
      }
      console.log(csv);
      let hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
      hiddenElement.target = '_blank';
      hiddenElement.download = title;
      hiddenElement.click();
    },
    compare: function(a, b){
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      const dateA = a.date.toUpperCase();
      const dateB = b.date.toUpperCase();

      if (nameA > nameB) {
        return 1;
      }
      else if (nameA < nameB) {
        return -1;
      }
      else {
        if (dateA > dateB){
          return 1;
        }
        else if (dateA < dateB){
          return -1;
        }
        return 0;
      }
    }
  },
  components: {
    AccessTableDaily,
    AccessTableWeekly,
    AccessTableMonthly
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
