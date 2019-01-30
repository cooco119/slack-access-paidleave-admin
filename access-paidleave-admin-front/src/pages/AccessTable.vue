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
                  <md-option v-for="curYear in years" :value="curYear" :key="curYear">  {{curYear}}년</md-option>
                </md-select>
              </md-field>
            </div>
            <div class="md-layout-item">
              <md-field>
                <label for="year">월</label>
                <md-select v-model="select_weekly_month" name="월" id="month">
                  <md-option v-for="curMonth in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]" :value="curMonth" :key="curMonth">  {{curMonth}}월</md-option>
                </md-select>
              </md-field>
            </div>
            <div class="md-layout-item">
              <md-field>
                <label for="year">주</label>
                <md-select v-model="select_weekly_week" name="주" id="week">
                  <md-option v-for="curWeek in [1, 2, 3, 4, 5]" :value="curWeek" :key="curWeek">  {{curWeek}}주</md-option>
                </md-select>
              </md-field>
            </div>
          </div>
          <div class="md-layout" v-if="radio === 'monthly'">
            <div class="md-layout-item">
              <md-field>
                <label for="year">연도</label>
                <md-select v-model="select_weekly_year" name="연도" id="year">
                  <md-option v-for="curYear in years" :value="curYear" :key="curYear">  {{curYear}}년</md-option>
                </md-select>
              </md-field>
            </div>
            <div class="md-layout-item">
              <md-field>
                <label for="year">월</label>
                <md-select v-model="select_weekly_month" name="월" id="month">
                  <md-option v-for="curMonth in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]" :value="curMonth" :key="curMonth">  {{curMonth}}월</md-option>
                </md-select>
              </md-field>
            </div>
          </div>
        </div>
        </md-card-content>
      </md-card>
      <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-100">
        <md-card>
          <md-card-header data-background-color="green">
            <h4 class="title">Simple Table</h4>
            <p class="category">Here is a subtitle for this table</p>
          </md-card-header>
          <md-card-content>
            <simple-table table-header-color="green"></simple-table>
          </md-card-content>
        </md-card>
      </div>

      <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-100">
        <md-card class="md-card-plain">
          <md-card-header data-background-color="green">
            <h4 class="title">Table on Plain Background</h4>
            <p class="category">Here is a subtitle for this table</p>
          </md-card-header>
          <md-card-content>
            <ordered-table></ordered-table>
          </md-card-content>
        </md-card>
      </div>
    </div>
  </div>
</template>

<script>
import { SimpleTable, OrderedTable } from "@/components";

export default {
  data: () => ({
    radio: "daily",
    select_daily: null,
    select_weekly_year: null,
    select_weekly_month: null,
    select_weekly_week: null,
    day: null
  }),
  components: {
    OrderedTable,
    SimpleTable
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
