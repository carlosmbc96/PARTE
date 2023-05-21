<script setup>
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { createToast } from "mosha-vue-toastify";
import LogoGoogle from "../assets/logo_google.png";
import Logo from "../assets/LOGO-01.png";
import { ref } from "vue";
import { app, db } from "../firebase";
import typeNotification from "../notificationConfig";
import { useAuthUserStore } from "../store";

defineProps({
  color: String,
});

const provider = new GoogleAuthProvider();
const auth = getAuth(app);
const store = useAuthUserStore();
const logout_condition = ref(false);

const login = async () => {
  store.loading = true;
  try {
    const dataUser = await signInWithPopup(auth, provider);
    const { displayName, photoURL, email } = dataUser.user;
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const getUsersByEmail = await getDocs(q);
      if (getUsersByEmail.empty) {
        try {
          await addDoc(collection(db, "users"), {
            name: displayName,
            profile_picture: photoURL,
            email,
          });
          store.loading = false;
        } catch (error) {}
      } else store.loading = false;
    } catch (error) {}
    const { msg, config } = typeNotification(
      "Ha iniciado sesión correctamente."
    ).success;
    createToast(msg, config);
    store.user = {
      email,
      name: displayName,
      profile_picture: photoURL,
    };
  } catch (error) {
    const { msg, config } = typeNotification(
      "Ha ocurrido un error al iniciar sesión."
    ).danger;
    createToast(msg, config);
  }
};
const logout = async () => {
  logout_condition.value = true;
  setTimeout(() => {
    store.loading = true;
    setTimeout(async () => {
      try {
        await signOut(auth);
        store.user = null;
      } catch (error) {
        console.error(error);
      } finally {
        store.loading = false;
      }
    }, 250);
  }, 250);
};
</script>

<template>
  <button
    title="Iniciar sesión"
    class="btn-login"
    @click="login"
    v-if="!store.user"
  >
    Iniciar sesión con Google
    <img class="btn-logo-google" :src="LogoGoogle" alt="Logo de google" />
  </button>
  <template v-else>
    <div class="logout-container">
      <!-- <div class="logo-app-container">
        <img class="logo-app" :src="Logo" alt="Logo PARTE" />
        <span>PARTE</span>
      </div> -->
      <div class="logout-container-data">
        <span>👋🏻 {{ store.user.name }}</span>
        <img
          class="user-avatar"
          :src="store.user.profile_picture"
          alt="Avatar del usuario"
        />
        <span
          :class="{ loged: store.user && !logout_condition }"
          id="checkbox"
        />
        <label @click="logout" for="checkbox" class="switch">
          <div class="powersign"></div>
        </label>
      </div>
    </div>
  </template>
</template>

<style scoped>
.logout-container-data {
  display: flex;
  align-items: center;
  gap: 1em;
  margin-right: 2em;
}
.logo-app-container {
  display: flex;
  align-items: center;
  gap: 0.5em;
}
.logo-app-container span {
}
.logo-app {
  width: 3em;
  height: 3em;
  margin-left: 2em;
}
#checkbox {
  display: none;
  transition: 0.25s ease;
}

.switch {
  position: absolute;
  width: 3em;
  height: 3em;
  background-color: #212121;
  border-radius: 50%;
  z-index: 1;
  cursor: pointer;
  top: 70px;
  right: 0;
  margin-right: 2em;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #212121;
  box-shadow: 0px 0px 3px rgb(2, 2, 2) inset;
  transition: 0.25s ease;
}

.powersign {
  position: relative;
  width: 30%;
  height: 30%;
  border: 4px solid rgb(48, 48, 48);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.25s ease;
}

.powersign::before {
  content: "";
  width: 8px;
  height: 100%;
  background-color: #212121;
  position: absolute;
  top: -60%;
  z-index: 2;
  transition: 0.25s ease;
}

.powersign::after {
  content: "";
  width: 4px;
  height: 100%;
  background-color: rgb(48, 48, 48);
  position: absolute;
  top: -60%;
  z-index: 3;
  transition: 0.25s ease;
}

#checkbox.loged + .switch .powersign {
  border: 4px solid v-bind(color);
  transition: 0.25s ease;
}

#checkbox.loged + .switch .powersign::after {
  background-color: v-bind(color);
  transition: 0.25s ease;
}

#checkbox.loged + .switch {
  transition: 0.25s ease;
}

#checkbox.loged + .switch .powersign::before {
  transition: 0.25s ease;
}

.btn-login {
  padding: 2em 1em;
  cursor: pointer;
  display: flex;
  background-color: rgb(25, 25, 25);
  color: #a0a0a0b8;
  border: none;
  border-radius: 5px;
  height: 3em;
  flex-direction: row;
  align-items: center;
  width: 100%;
  transition: 0.25s ease;
  font-size: 0.8em;
  /* padding: 0; */
  gap: 1em;
}
.btn-login:hover {
  box-shadow: 3px 3px 10px 1px black;
  transform: translateY(-5px);
}
.btn-login:active {
  transform: scale(105%);
}
.btn-logo-google {
  height: 2em;
  width: 2em;
}
.logout-container {
  position: absolute;
  display: flex;
  flex-direction: row;
  top: 0;
  right: 0;
  padding: 1em 0;
  align-items: center;
  justify-content: flex-end;
  gap: 1em;
  width: 100%;
}
.btn-logout {
  position: absolute;
  top: 60px;
  right: 0;
  display: flex;
  margin: 1rem 1rem 0 0;
  width: 3rem;
  height: 3rem;
  box-shadow: 0 0 10px black;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: 0.25s ease;
  z-index: 1;
}
.btn-logout:hover {
  animation: shake 0.3s linear infinite both;
}
.icon-logout {
  width: 2rem;
  height: 2rem;
}
.btn-login .spinner {
  width: 2em;
  height: 2em;
}
@keyframes shake {
  0% {
    -webkit-transform: translate(0);
    transform: translate(0);
  }

  20% {
    -webkit-transform: translate(-2px, 2px);
    transform: translate(-2px, 2px);
  }

  40% {
    -webkit-transform: translate(-2px, -2px);
    transform: translate(-2px, -2px);
  }

  60% {
    -webkit-transform: translate(2px, 2px);
    transform: translate(2px, 2px);
  }

  80% {
    -webkit-transform: translate(2px, -2px);
    transform: translate(2px, -2px);
  }

  100% {
    -webkit-transform: translate(0);
    transform: translate(0);
  }
}
@media (max-width: 1000px) {
  .logout-container {
    text-align: end;
  }
  .logout-container-data{
    gap: 2em;
  }
  .switch{
    top: 82px;
  }
  /* .switch {
    width: 2.3em;
    height: 2.3em;
  } */
  /* .user-avatar {
    width: 2.3em;
    height: 2.3em;
  } */
  /* .logout-container-data span {
    display: none;
  } */
  .logo-app-container span {
    display: none;
  }
  .logo-app {
    width: 5em;
    height: 5em;
    margin-left: 2em;
    position: absolute;
    margin: 0 auto;
    left: 0;
    right: 0;
    top: 35px;
  }
}
</style>
