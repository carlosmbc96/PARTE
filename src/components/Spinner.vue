<script setup></script>
<template>
  <div class="spinner">
    <!-- <div class="spinner-inner"></div> -->
  </div>
</template>
<style scoped>
.spinner {
  background-image: linear-gradient(#00ffaa 35%, #ffffff);
  width: 100px;
  height: 100px;
  animation: spinning82341 1.7s linear infinite;
  text-align: center;
  border-radius: 50px;
  filter: blur(1px);
  display: flex;
  position: relative;
  box-shadow: 0px -5px 20px 0px #00ffaa, 0px 5px 20px 0px #ffffff;
}
.spinner::after {
  content: "";
  position: absolute;
  background-color: rgb(36, 36, 36);
  width: 100px;
  height: 100px;
  border-radius: 50px;
  filter: blur(10px);
}
/* .spinner-inner {
  background-color: rgb(36, 36, 36);
  width: 100px;
  height: 100px;
  border-radius: 50px;
  filter: blur(10px);
} */

@keyframes spinning82341 {
  to {
    transform: rotate(360deg);
  }
}
</style>
