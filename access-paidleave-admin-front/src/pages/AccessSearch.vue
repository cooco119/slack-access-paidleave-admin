<template>
  <div class="content">
    <div class="md-layout">
      <md-card>
        <md-card-content>
        <h5 class="title">조회 범위 설정하기</h5>
        <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-100">
          <md-radio v-model="radio" value="daily">일별 조회</md-radio>
          <md-radio v-model="radio" value="weekly">주별 조회</md-radio>
          <md-radio v-model="radio" value="monthly">월별 조회</md-radio>
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
                  <md-option v-for="curYear in years" :value="curYear" :key="curYear">
                    <label style="line-height: 50px; padding-left: 10px">{{curYear}}년</label>
                  </md-option>
                </md-select>
              </md-field>
            </div>
            <div class="md-layout-item">
              <md-field>
                <label for="year">월</label>
                <md-select v-model="select_weekly_month" name="월" id="month">
                  <md-option v-for="curMonth in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]" :value="curMonth" :key="curMonth">
                    <label style="line-height: 50px; padding-left: 10px">{{curMonth}}월</label>
                  </md-option>
                </md-select>
              </md-field>
            </div>
            <div class="md-layout-item">
              <md-field>
                <label for="year">주</label>
                <md-select v-model="select_weekly_week" name="주" id="week">
                  <md-option v-for="curWeek in [1, 2, 3, 4, 5]" :value="curWeek" :key="curWeek">
                    <label style="line-height: 50px; padding-left: 10px">{{curWeek}}주</label>
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
                  <md-option v-for="curYear in years" :value="curYear" :key="curYear">
                    <label style="line-height: 50px; padding-left: 10px">{{curYear}}년</label>
                  </md-option>
                </md-select>
              </md-field>
            </div>
            <div class="md-layout-item">
              <md-field>
                <label for="year">월</label>
                <md-select v-model="select_monthly_month" name="월" id="month">
                  <md-option v-for="curMonth in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]" :value="curMonth" :key="curMonth">
                    <label style="line-height: 50px; padding-left: 10px">{{curMonth}}월</label>
                  </md-option>
                </md-select>
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
            <h4 class="title">출퇴근 조회 결과</h4>
          </md-card-header>
          <md-card-content>
            <div v-show="radio === 'daily'">
              <md-table v-model="table_data_day">
                <md-table-row slot="md-table-row" slot-scope="{ item }">
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
                <md-table-row slot="md-table-row" slot-scope="{ item }">
                  <md-table-cell md-label="이름">{{ item.name }}</md-table-cell>
                  <md-table-cell md-label="해당연월">{{ item.date }}</md-table-cell>
                  <md-table-cell md-label="해당 주">{{ item.week }}</md-table-cell>
                  <md-table-cell md-label="총 근무 시간">{{ item.duration }}</md-table-cell>
                </md-table-row>
              </md-table>
            </div>
            <div v-show="radio === 'monthly'">
              <md-table v-model="table_data_month" >
                <md-table-row slot="md-table-row" slot-scope="{ item }">
                  <md-table-cell md-label="이름">{{ item.name }}</md-table-cell>
                  <md-table-cell md-label="해당 연월">{{ item.date }}</md-table-cell>
                  <md-table-cell md-label="총 근무 시간">{{ item.duration }}</md-table-cell>
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
    table_data_month: []
  }),
  methods: {
    submit: function (event){
      const url_prefix = "http://c063c4f4.ngrok.io/api/v1";
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
            headers: {
              "content-type": "application/x-www-form-urlencoded; charset=utf-8",
              "Accept": "application/json"
            }
          }).then( async res => {
            let tmp = await res.json();
            tmp = JSON.parse(JSON.stringify(tmp));
            console.log(tmp.result[0]);
            for (let i = 0; i < tmp.result.length; i++){
              self.table_data_day.push(tmp.result[i]);
            }
            console.log(self.table_data_day);
          })
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
            headers: {
              "content-type": "application/x-www-form-urlencoded; charset=utf-8",
              "Accept": "application/json"
            }
          }).then( async res => {
            let tmp = await res.json();
            tmp = JSON.parse(JSON.stringify(tmp));
            console.log(tmp.result);
            for (let i = 0; i < tmp.result.length; i++){
              self.table_data_week.push(tmp.result[i]);
            }
            console.log(self.table_data_week);
          })
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
            headers: {
              "content-type": "application/x-www-form-urlencoded; charset=utf-8",
              "Accept": "application/json"
            }
          }).then( async res => {
            let tmp = await res.json();
            tmp = JSON.parse(JSON.stringify(tmp));
            console.log(tmp.result[0]);
            for (let i = 0; i < tmp.result.length; i++){
              self.table_data_month.push(tmp.result[i]);
            }
            console.log(self.table_data_month);
          })
          break;
        default: 
          alert("에러, 정확한 입력 필요.");
          break;
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
