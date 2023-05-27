<script setup>
import { collection, onSnapshot } from "firebase/firestore";
import { onMounted, ref } from "vue";
import { db } from "../firebase";
import { useAuthUserStore } from "../store";

const emit = defineEmits(["selected_users"]);

const users_list = ref([]);
const store = useAuthUserStore();

onMounted(() => {
  loadUsers();
  const carousel = document.querySelector(".users-container-wrapper");

  let isDragStart = false,
    isDragging = false,
    prevPageX,
    prevScrollLeft,
    positionDiff;

  const dragStart = (e) => {
    // updatating global variables value on mouse down event
    isDragStart = true;
    prevPageX = e.pageX || e.touches[0].pageX;
    prevScrollLeft = carousel.scrollLeft;
  };

  const dragging = (e) => {
    // scrolling images/carousel to left according to mouse pointer
    if (!isDragStart) return;
    e.preventDefault();
    isDragging = true;
    carousel.classList.add("dragging");
    positionDiff = (e.pageX || e.touches[0].pageX) - prevPageX;
    carousel.scrollLeft = prevScrollLeft - positionDiff;
  };

  const dragStop = () => {
    isDragStart = false;
    carousel.classList.remove("dragging");

    if (!isDragging) return;
    isDragging = false;
  };

  carousel.addEventListener("mousedown", dragStart);
  carousel.addEventListener("touchstart", dragStart);

  document.addEventListener("mousemove", dragging);
  carousel.addEventListener("touchmove", dragging);

  document.addEventListener("mouseup", dragStop);
  carousel.addEventListener("touchend", dragStop);
});

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
    <div class="users-container-wrapper">
      <div
        @click="selectUser(user)"
        :class="{ 'user-active': isSelected(user) }"
        class="user-card"
        v-for="user in users_list"
        :key="user.email"
      >
        <img :src="user.profile_picture" :alt="user.name" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.user-card img {
  width: 3em;
  height: 3em;
  border-radius: 50%;
}
.users-container-wrapper.dragging {
  cursor: grab;
  scroll-behavior: auto;
}
.users-container-wrapper.dragging div {
  pointer-events: none;
}
.users-container {
  display: flex;
  justify-content: center;
  gap: 1em;
  padding: 1em;
}
.users-container-wrapper {
  display: flex;
  flex-wrap: nowrap;
  cursor: pointer;
  overflow: hidden;
  scroll-behavior: smooth;
  padding: 0.5em 0;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  scroll-behavior: smooth;
}
.user-card {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: 0.25s ease;
  border-radius: 50%;
  width: 3em;
  height: 3em;
  margin: 0 0.5em;
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
