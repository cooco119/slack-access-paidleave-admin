<template>
  <md-toolbar md-elevation="0" class="md-transparent">
    <div class="md-toolbar-row">
      <div class="md-toolbar-section-start">
        <h3 class="md-title">{{$route.name}}</h3>
      </div>
      <div class="md-toolbar-section-end">
        <md-button class="md-just-icon md-simple md-toolbar-toggle" :class="{toggled: $sidebar.showSidebar}" @click="toggleSidebar">
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </md-button>

        <div class="md-collapse">
          <md-list>
            <md-list-item to='/login'>
              <i class="material-icons">person</i>
              <p class="hidden-lg hidden-md">Login</p>
            </md-list-item>
            <md-list-item @click="logout">
              <i class="material-icons">exit_to_app</i>
              <p class="hidden-lg hidden-md">Logout</p>
            </md-list-item>
          </md-list>
        </div>
      </div>
    </div>

  </md-toolbar>
</template>

<script>
export default {
  methods: {
    toggleSidebar() {
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
    },
    logout() {
      const url_logout = "http://192.168.101.198/logout";
      fetch(url_logout, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }).then( res => {
        if (res.status === 200){
          alert("로그아웃 성공");
        }
        else {
          console.log("로그아웃 실패", res);
        }
      })
    }
  }
};
</script>

<style lang="css">
</style>
