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
          <md-button class="md-raised">확인</md-button>
        </md-card-content>
      </md-card>
      <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-100">
        <md-card class="md-card-plain">
          <md-card-header data-background-color="green">
            <h4 class="title">연차 조회 결과</h4>
          </md-card-header>
          <md-card-content>
            <paidleave-table></paidleave-table>
          </md-card-content>
        </md-card>
      </div>
    </div>
  </div>
</template>

<script>
import { PaidleaveTable } from "@/components";

export default {
  data: () => ({
    name: null
  }),
  components: {
    PaidleaveTable
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
