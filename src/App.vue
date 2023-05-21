<script setup>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { onBeforeMount, ref } from "vue";
import Login from "./components/Login.vue";
import Spinner from "./components/Spinner.vue";
import TasksPanel from "./components/TaskPanel.vue";
import { app } from "./firebase";
import { useAuthUserStore } from "./store";

const auth = getAuth(app);
const store = useAuthUserStore();

onBeforeMount(() => {
  store.loading = true;
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const { displayName, photoURL, email } = user;
      store.user = {
        email,
        name: displayName,
        profile_picture: photoURL,
      };
    } else {
    }
    store.loading = false;
  });
});
</script>

<template>
  <Transition mode="out-in">
    <section v-if="!store.loading">
      <Login :color="store.color" />
      <TasksPanel v-if="store.user" />
    </section>
    <Spinner v-else />
  </Transition>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");
* {
  font-family: "Poppins", sans-serif;
}
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 1s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
.mosha__toast.success {
  background-color: #02ffaa60;
  box-shadow: 0px 0px 10px -3px #02ffaa;
}
.mosha__toast.danger {
  background-color: #fe000024;
  box-shadow: 0px 0px 10px -3px #fe0000;
}
.mosha__toast__content__text {
  color: rgb(224 224 224);
}
.mosha__toast__content__description {
  color: rgba(224 224 224);
}
.mosha__toast__close-icon {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.mosha__toast__close-icon::before {
  top: 0;
}
.mosha__toast__progress {
  height: 2px;
  color: rgba(224, 224, 224, 0.567);
}
.mosha__icon {
  display: flex;
}
.user-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  z-index: 1;
}
</style>
