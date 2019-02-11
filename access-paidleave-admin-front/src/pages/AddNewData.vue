<template>
  <div class="content">
    <div class="md-layout">
      <md-card>
        <md-card-content>
        <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-100">
          <label style="font-size: 18px;">출퇴근/휴가 선택 : &nbsp; &nbsp; &nbsp;</label>
          <md-radio v-on:change="select" v-model="type" value="access">출퇴근</md-radio>
          <md-radio v-on:change="select" v-model="type" value="paidleave">휴가</md-radio>
        </div>
        <div style="padding: 10px "/>
        <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-100">
          <label style="font-size: 18px;">날짜 선택 : &nbsp; &nbsp; &nbsp;</label>
          <md-datepicker v-model="date">
            <label>날짜 선택</label>
          </md-datepicker>
          <div class="md-layout">
            <div class="md-layout-item">
              <md-field>
                <label>연도</label>
                <md-select v-model="select_year" name="연도" id="year">
                  <md-option style="vertical-align: middle; line-height: 50px; padding-left: 10px" v-for="curYear in years" v-bind:value="curYear" v-bind:key="curYear">
                    {{curYear}}년
                  </md-option>
                </md-select>
              </md-field>
            </div>
            <div class="md-layout-item">
              <md-field>
                <label>월</label>
                <md-select v-model="select_month" name="월" id="month">
                  <md-option style="line-height: 50px; padding-left: 10px" v-for="curMonth in 12" v-bind:value="curMonth" v-bind:key="curMonth">
                    {{curMonth}}월
                  </md-option>
                </md-select>
              </md-field>
            </div>
            <div class="md-layout-item">
              <md-field>
                <label>일</label>
                <md-select v-model="select_day" name="일" id="day">
                  <md-option style="line-height: 50px; padding-left: 10px" v-for="curDay in lastDay" v-bind:value="curDay" v-bind:key="curDay">
                    {{curDay}}일
                  </md-option>
                </md-select>
              </md-field>
            </div>
          </div>
        </div>
        <div style="padding: 10px "/>
        <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-100">
          <label style="font-size: 18px;">분류 선택 : &nbsp; &nbsp; &nbsp;</label>
          <md-radio v-show="type === 'access'" v-model="type_access" value="attend">출근</md-radio>
          <md-radio v-show="type === 'access'" v-model="type_access" value="goHome">퇴근</md-radio>
          <md-radio v-show="type === 'access'" v-model="type_access" value="goOut">외출</md-radio>
          <md-radio v-show="type === 'access'" v-model="type_access" value="getIn">복귀</md-radio>
          <md-radio v-show="type === 'paidleave'" v-model="type_paidleave" value="full">연차</md-radio>
          <md-radio v-show="type === 'paidleave'" v-model="type_paidleave" value="morning">반차(오전)</md-radio>
          <md-radio v-show="type === 'paidleave'" v-model="type_paidleave" value="afternoon">반차(오후)</md-radio>
        </div>
        <div style="padding: 10px "/>
        <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-100">
          <label style="font-size: 18px;">이름 : &nbsp; &nbsp; &nbsp;</label>
          <md-field>
            <label>이름 입력</label>
            <md-input v-model="name" v-on:keydown.enter="submit" ></md-input>
          </md-field>
        </div>
        </md-card-content>
        <md-card-content>
          <md-button v-on:click="submit" class="md-raised">확인</md-button>
        </md-card-content>
      </md-card>
    </div>
  </div>
</template>

<script>
import { AccessTableDaily, AccessTableWeekly, AccessTableMonthly } from "@/components";
import { encode } from 'punycode';
const queryString = require('query-string');

export default {
  data: () => ({
    type: "access",
    select_year: 2015,
    select_month: 1,
    select_day: 1,
    type_access: null,
    type_paidleave: null,
    access_enum: Object.freeze({"attend": "출근", "goHome": "퇴근", "goOut": "외출", "getIn": "복귀"}),
    paidleave_enum: Object.freeze({"full": "연차", "morning": "반차(오전)", "afternoon": "반차(오후)"}),
    name: null
  }),
  methods: {
    test: function (event) {
      console.log(this.access_enum[this.type_access]);
    },
    select : function (event) {
      this.select_year = 2015;
      this.select_month = 1;
      this.select_day = 1;
      this.type_access = null;
      this.type_paidleave = null;
      this.name = null;
    },
    submit: function (event){
      const url_prefix = "http://192.168.101.198/api/v1";
      let result, response;
      let self = this;
      let url, content;
      if (this.type === "access"){
        url = url_prefix + "/access/insert";
        content = {
          "type": this.type_access,
          "date": this.date,
          "name": this.name
        };
      }
      else if (this.type === "paidleave"){
        url = url_prefix + "/paidleave/insert";
        content = {
          "type": this.type_paidleave,
          "date": this.date,
          "name": this.name
        }
      }
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(content)
      }).then( res => {
        if (res.status === 200){
          console.log(res.json());
          alert("다음 내용이 성공적으로 등록되었습니다.\n" + 
                `- 분류: ${this.type === 'access' ? 출퇴근 : 휴가} - ${this.type_access !== null ? this.access_enum[this.type_access] : this.paidleave_enum[this.type_paidleave]}\n` + 
                `- 날짜: ${this.date.getLocaleDateString()}\n` + 
                `- 이름: ${this.name}`);
        }
        else{
          console.log("Fetch failed.");
        }
      }).catch(err => {
        console.error(err);
      })
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
    },
    date: {
      get: function () {
        return new Date(this.select_year, this.select_month - 1, this.select_day);
      },
      set: function (val) {
        this.select_year = val.getFullYear();
        this.select_month = val.getMonth() + 1;
        this.select_day = val.getDate();
      }
    },
    lastDay: function (event){
      return (new Date(this.select_year, this.select_month, 0)).getDate();
    }
  }
};
</script>
