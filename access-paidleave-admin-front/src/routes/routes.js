import DashboardLayout from "@/pages/Layout/DashboardLayout.vue";

import Dashboard from "@/pages/Dashboard.vue";
import WorkTimePage from "@/pages/WorkTimeSearch.vue";
import PaidLeavePage from "@/pages/PaidLeaveSearch.vue";
import LoginPage from "@/pages/LoginPage.vue";
import AddNewData from "@/pages/AddNewData.vue";
import AccessPage from "@/pages/AccessSearch.vue";

const routes = [
  {
    path: "/login",
    name: "로그인",
    component: LoginPage
  },
  {
    path: "/main",
    component: DashboardLayout,
    name: "main",
    redirect: "/main/add",
    children: [
      {
        path: "worktime",
        name: "근무시간 조회",
        component: WorkTimePage
      },
      {
        path: "paidleave",
        name: "휴가 내역 조회",
        component: PaidLeavePage
      },
      {
        path: "add",
        name: "출퇴근/휴가 신규 등록",
        component: AddNewData
      },
      {
        path: "dashboard",
        name: "대시보드",
        component: Dashboard
      },
      {
        path: "access",
        name: "출입 기록 조회",
        component: AccessPage
      }
    ]
  },
  {
    path: "/",
    name: "root",
    redirect: "/main"
  }
];

export default routes;
