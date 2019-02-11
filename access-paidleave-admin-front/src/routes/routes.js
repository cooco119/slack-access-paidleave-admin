import DashboardLayout from "@/pages/Layout/DashboardLayout.vue";

import Dashboard from "@/pages/Dashboard.vue";
import AccessTable from "@/pages/AccessSearch.vue";
import PaidLeaveTable from "@/pages/PaidLeaveSearch.vue";
import LoginPage from "@/pages/LoginPage.vue";
import AddNewData from "@/pages/AddNewData.vue";

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
    redirect: "/main/dashboard",
    children: [
      {
        path: "dashboard",
        name: "대쉬보드",
        component: Dashboard
      },
      {
        path: "access",
        name: "출퇴근 조회 관리",
        component: AccessTable
      },
      {
        path: "paidleave",
        name: "연차 조회 관리",
        component: PaidLeaveTable
      },
      {
        path: "add",
        name: "출퇴근/휴가 신규 등록",
        component: AddNewData
      },
      {
        path: "login",
        name: "로그인",
        component: LoginPage
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
