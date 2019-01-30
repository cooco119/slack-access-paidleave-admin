import DashboardLayout from "@/pages/Layout/DashboardLayout.vue";

import Dashboard from "@/pages/Dashboard.vue";
import AccessTable from "@/pages/AccessSearch.vue";
import PaidLeaveTable from "@/pages/PaidLeaveSearch.vue";

const routes = [
  {
    path: "/",
    component: DashboardLayout,
    redirect: "/dashboard",
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
      }
    ]
  }
];

export default routes;
