<template>
  <div class="wrapper" :class="{'nav-open': $sidebar.showSidebar}">
    <notifications></notifications>

    <side-bar>
      <mobile-menu slot="content"></mobile-menu>
      <sidebar-link to="/main/add">
        <md-icon>event</md-icon>
        <p>출퇴근/휴가 신규 등록</p>
      </sidebar-link>
      <sidebar-link to="/main/worktime">
        <md-icon>list</md-icon>
        <p>근무시간 조회</p>
      </sidebar-link>
      <sidebar-link to="/main/paidleave">
        <md-icon>list</md-icon>
        <p>휴가 내역 조회</p>
      </sidebar-link>
      <sidebar-link to="/main/access">
        <md-icon>list</md-icon>
        <p>출입 기록 조회</p>
      </sidebar-link>
      <sidebar-link to="/main/members">
        <md-icon>list</md-icon>
        <p>직원 정보 조회/변경</p>
      </sidebar-link>
    </side-bar>

    <div class="main-panel">
      <top-navbar></top-navbar>

      <dashboard-content>

      </dashboard-content>

      <content-footer v-if="!$route.meta.hideFooter"></content-footer>
    </div>
  </div>
</template>
<style lang="scss">
</style>
<script>
import TopNavbar from "./TopNavbar.vue";
import ContentFooter from "./ContentFooter.vue";
import DashboardContent from "./Content.vue";
import MobileMenu from "@/pages/Layout/MobileMenu.vue";

export default {
  components: {
    TopNavbar,
    DashboardContent,
    ContentFooter,
    MobileMenu
  }
};
</script>
