<script setup>
import { collection, onSnapshot } from "firebase/firestore";
import { onBeforeMount, ref } from "vue";
import { db } from "../firebase";
import { useAuthUserStore } from "../store";

const emit = defineEmits(["selected_users"]);

const users_list = ref([]);
const store = useAuthUserStore();

onBeforeMount(() => loadUsers());

const loadUsers = () => {
  const stop_listener = onSnapshot(collection(db, "users"), (users) => {
    users_list.value = [];
    users.forEach((user) => {
      users_list.value.push(user.data());
    });
  });
};

const selectUser = (user) => {
  const index = store.users_selected.findIndex((u) => u.email === user.email);
  index !== -1
    ? store.users_selected.splice(index, 1)
    : store.users_selected.push(user);
  emit("selected_users");
};

const isSelected = (user) => {
  const found = store.users_selected.find((u) => objectCompare(u, user));
  return !!found;
};

const objectCompare = (obj1 = {}, obj2 = {}) => {
  const keys1 = obj1 && Object.keys(obj1);
  const keys2 = obj2 && Object.keys(obj2);
  if (keys1?.length !== keys2.length) return false;

  for (let key of keys1) {
    let val1 = obj1[key];
    let val2 = obj2[key];

    if (val1 !== val2) return false;
  }

  return true;
};
</script>

<template>
  <section class="users-container">
    <div
      @click="selectUser(user)"
      class="user-card"
      :class="{ 'user-active': isSelected(user) }"
      v-for="user in users_list"
      :key="user.email"
    >
      <img
        class="user-avatar-select"
        :src="user.profile_picture"
        :alt="user.name"
      />
    </div>
  </section>
</template>

<style scoped>
.user-avatar-select {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
}
.users-container {
  display: flex;
  justify-content: center;
  gap: 1.2em;
  flex-wrap: wrap;
}
.user-card {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: 0.25s ease;
  border-radius: 50%;
}
.user-card:hover {
  filter: brightness(0.5);
}
.user-card.user-active:hover {
  filter: brightness(1);
}
.user-active {
  box-shadow: 0 0 5px #02ffaa;
  transform: scale(120%);
  transition: 0.25s;
}
.user-card::after {
  content: "";
  background-color: #02ffaa3d;
  height: 3em;
  width: 3em;
  position: absolute;
  border-radius: 50%;
  opacity: 0;
  transition: 0.25s;
}
.user-card.user-active::after {
  opacity: 1;
}
</style>
