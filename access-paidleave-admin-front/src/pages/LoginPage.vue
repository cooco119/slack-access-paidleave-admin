<template>
  <div class="content">
    <div class="md-layout" style="justify-content: center">
      <md-card md-alignment="space-between" style="width:50%">
        <md-card-content>
          <div class="title">
            <div class="md-title">로그인</div>
            <div class="md-body-1">관리자 계정으로 로그인한 후에 이용 가능합니다.</div>
          </div>

          <div class="form">
            <md-field>
              <label>E-mail</label>
              <md-input v-model="login.email" autofocus></md-input>
            </md-field>

            <md-field md-has-password>
              <label>Password</label>
              <md-input v-model="login.password" v-on:keydown.enter="auth" type="password"></md-input>
            </md-field>
          </div>

          <div class="actions md-layout md-alignment-center-space-between">
            <!-- <a href="/resetpassword">Reset password</a> -->
            <md-button class="md-raised md-primary" @click="auth" data-background-color="green">Log in</md-button>
          </div>
      </md-card-content>
    </md-card>
    </div>
  </div>
</template>

<script>
const queryString = require('query-string');

export default {
  data: () => ({
    login: {
      email: "",
      password: ""
    }
  }),
  methods: {
    auth() {
      let data = {
        "email": this.login.email,
        "password": this.login.password
      };
      data = queryString.stringify(data);
      console.log(data);
      const url_login = "http://192.168.101.198/login";
      fetch(url_login, {
        method: "POST",
        credentials: "include",
        // mode: 'cors',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: data
      }).then (res => {
        if (res.status === 200){
          console.log("Login success!");
          this.$router.push('main');
        }
        else {
          console.log(res);
          alert("로그인 실패, 이메일과 비밀번호를 확인하여 주세요.");
        }
      })
    }
  }
};
</script>