<template>
  <footer class="footer">
    <div class="container">
        <nav>
            <ul>
              <li>
                <router-link :to="{path:'/main/dashboard'}">Home</router-link>
              </li>
            </ul>
        </nav>
        <div class="copyright text-center">
          &copy; {{ new Date().getFullYear() }} <label>JaeJun Lee</label>
        </div>
    </div>
  </footer>

</template>
<script>
export default {};
</script>
<style>
</style>
