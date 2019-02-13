<template>
  <div class="content">
    <div class="md-layout">
      <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-50">
        <md-card>
          <md-card-header data-background-color="orange">
            <h4 class="title">최근 출입 기록</h4>
            <p class="category">최근 항목 표기</p>
          </md-card-header>
          <md-card-content>
            <ordered-table table-header-color="orange"></ordered-table>
          </md-card-content>
        </md-card>
      </div>
      <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-50">
        <md-card>
          <md-card-header data-background-color="green">
            <h4 class="title">최근 연차 사용 기록</h4>
            <p class="category">최근 항목 표기</p>
          </md-card-header>
          <md-card-content>
            <ordered-table table-header-color="green"></ordered-table>
          </md-card-content>
        </md-card>
      </div>
      <!-- <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-50">
        <nav-tabs-card>
          <template slot="content">
            <span class="md-nav-tabs-title">Tasks:</span>
            <md-tabs md-sync-route class="md-success" md-alignment="left">

              <md-tab id="tab-home" md-label="Bugs" md-icon="bug_report">
                <nav-tabs-table></nav-tabs-table>
              </md-tab>

              <md-tab id="tab-pages" md-label="Website" md-icon="code">
                <nav-tabs-table></nav-tabs-table>
              </md-tab>

              <md-tab id="tab-posts" md-label="server" md-icon="cloud">
                <nav-tabs-table></nav-tabs-table>
              </md-tab>
            </md-tabs>
          </template>
        </nav-tabs-card>
      </div> -->
    </div>
  </div>
</template>

<script>
import {
  StatsCard,
  ChartCard,
  NavTabsCard,
  NavTabsTable,
  OrderedTable
} from "@/components";

export default {
  components: {
    StatsCard,
    ChartCard,
    NavTabsCard,
    NavTabsTable,
    OrderedTable
  },
  data() {
    return {
      dailySalesChart: {
        data: {
          labels: ["M", "T", "W", "T", "F", "S", "S"],
          series: [[12, 17, 7, 17, 23, 18, 38]]
        },
        options: {
          lineSmooth: this.$Chartist.Interpolation.cardinal({
            tension: 0
          }),
          low: 0,
          high: 50, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
          chartPadding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }
        }
      },
      dataCompletedTasksChart: {
        data: {
          labels: ["12am", "3pm", "6pm", "9pm", "12pm", "3am", "6am", "9am"],
          series: [[230, 750, 450, 300, 280, 240, 200, 190]]
        },

        options: {
          lineSmooth: this.$Chartist.Interpolation.cardinal({
            tension: 0
          }),
          low: 0,
          high: 1000, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
          chartPadding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }
        }
      },
      emailsSubscriptionChart: {
        data: {
          labels: [
            "Ja",
            "Fe",
            "Ma",
            "Ap",
            "Mai",
            "Ju",
            "Jul",
            "Au",
            "Se",
            "Oc",
            "No",
            "De"
          ],
          series: [[542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895]]
        },
        options: {
          axisX: {
            showGrid: false
          },
          low: 0,
          high: 1000,
          chartPadding: {
            top: 0,
            right: 5,
            bottom: 0,
            left: 0
          }
        },
        responsiveOptions: [
          [
            "screen and (max-width: 640px)",
            {
              seriesBarDistance: 5,
              axisX: {
                labelInterpolationFnc: function(value) {
                  return value[0];
                }
              }
            }
          ]
        ]
      }
    };
  }
};
</script>
