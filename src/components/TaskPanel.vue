<script setup>
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { createToast } from "mosha-vue-toastify";
import { onMounted, ref } from "vue";
import DeleteIcon from "../assets/delete_icon.png";
import EmptyIcon from "../assets/empty_icon.svg";
import UsersEmptyIcon from "../assets/users_empty_icon.png";
import { db } from "../firebase";
import typeNotification from "../notificationConfig";
import { useAuthUserStore } from "../store";
import FormTask from "./FormTask.vue";
import Spinner from "./Spinner.vue";
import HeaderImgBackground from "./HeaderImgBackground.vue";

const tasks = ref([]);
const showModal = ref(false);
const loadingData = ref(false);
const loadingList = ref([]);
const task = ref({ title: null, color: "#ffffff" });
const action = ref(null);
const filter_colors = ref([]);
const store = useAuthUserStore();

const showTaskForm = (taskParam = { users: [], color: "#ffffff" }) => {
  task.value = { ...taskParam };
  action.value = taskParam.title ? "EDIT" : "CREATE";
  changeModalVisibility();
};

const changeModalVisibility = () => {
  showModal.value = !showModal.value;
  store.loading = false;
};

onMounted(() => {
  loadTasks();
});

const loadTasks = (filter = false) => {
  loadingData.value = true;
  if (!filter) {
    filter_colors.value = [];
    store.filters_selected = [];
  }
  loadingList.value = [];
  const tasksRef = collection(db, "tasks");
  let q = null;
  if (store.filters_selected.length > 0) {
    q = query(
      tasksRef,
      where("users", "array-contains", store.user),
      where("color", "in", store.filters_selected)
    );
  } else {
    q = query(tasksRef, where("users", "array-contains", store.user));
  }
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    tasks.value = [];
    let position = 0;
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        tasks.value.push(doc.data());
        loadingList.value.push(false);
        tasks.value[position].id = doc.id;
        position++;
      });
      !filter && loadFilterColors();
    }
    loadingData.value = false;
  });
};

const deleteTask = async (idTask, indexLoading) => {
  loadingList.value[indexLoading] = true;
  try {
    await deleteDoc(doc(db, "tasks", idTask));
    const { msg, config } = typeNotification(
      "La tarea ha sido eliminada correctamente."
    ).success;
    createToast(msg, config);
    loadTasks();
  } catch (error) {
    const { msg, config } = typeNotification(
      "Ha ocurrido un error al eliminar la tarea."
    ).danger;
    createToast(msg, config);
  } finally {
    loadingList.value[indexLoading] = false;
  }
};

const loadFilterColors = () => {
  filter_colors.value = [];
  tasks.value.map((task) => {
    !filter_colors.value.includes(task.color) &&
      filter_colors.value.push(task.color);
  });
};

const handleFilters = (selected_filter) => {
  if (store.filters_selected.includes(selected_filter)) {
    store.filters_selected = store.filters_selected.filter(
      (filter) => filter !== selected_filter
    );
  } else {
    store.filters_selected.push(selected_filter);
  }
  loadTasks(true);
};
</script>

<template>
  <FormTask
    :show="showModal"
    :taskProp="task"
    :action="action"
    @reload="loadTasks"
    @onCloseModal="changeModalVisibility"
  />
  <div class="panel-container">
    <div class="header-container">
      <div class="add-task-container">
        <h1>Aquí tienes tus pendientes...</h1>
        <h6>
          Una aplicación para compartir tareas con tus amigos, familia o quien
          quieras...
        </h6>
        <button
          title="Agregar una nueva tarea"
          class="ad-task-container__btn"
          @click="showTaskForm()"
        >
          <span>Agregar tarea</span>
        </button>
        <div class="info">
          <span>*</span>
          Para agregar una tarea al mismo grupo(color) selecciona el color que
          quiere y presione en "Agregar tarea"
        </div>
      </div>
      <div class="img-background-container">
        <HeaderImgBackground :color="store.color" class="img-background" />
        <span
          class="img-background-blur"
          :style="{ backgroundColor: store.color }"
        ></span>
      </div>
    </div>

    <section v-if="filter_colors.length !== 0" class="filters-container">
      <span
        class="color"
        :style="{
          background: color,
          'box-shadow': `0 0 10px ${
            store.filters_selected.includes(color) ? color : 'transparent'
          }`,
        }"
        v-for="color in filter_colors"
        :key="color"
        @click="handleFilters(color)"
        :class="{
          'filter-active': store.filters_selected.includes(color),
        }"
      >
      </span>
    </section>
    <div class="tasks-container-style">
      <div
        class="circle"
        :style="{
          backgroundColor: store.color,
        }"
      ></div>
      <div
        class="circle"
        :style="{
          backgroundColor: store.color,
        }"
      ></div>
      <div class="tasks-container-style-inner">
        <Transition mode="out-in">
          <ul v-if="!loadingData">
            <template v-if="tasks.length !== 0">
              <div
                v-for="(task, index) in tasks"
                :key="task.id"
                @click="showTaskForm(task)"
                class="card-container"
              >
                <div
                  class="card-list-color"
                  :style="{ backgroundColor: task.color }"
                >
                  <div class="list-inline">
                    <div class="card-content"></div>
                    <li>{{ task.title }}</li>
                    <div class="actions-container">
                      <Transition mode="out-in">
                        <img
                          v-if="!loadingList[index]"
                          title="Eliminar tarea"
                          @click.stop="deleteTask(task.id, index)"
                          class="delete-icon"
                          :src="DeleteIcon"
                          alt="Eliminar tarea"
                        />
                        <Spinner v-else />
                      </Transition>
                    </div>
                    <section class="extra-info">
                      <template v-if="task.users?.length !== 0">
                        <img
                          v-for="user in task.users.slice(0, 3)"
                          class="user-avatar"
                          :src="user.profile_picture"
                          :alt="user.name"
                        />
                        <span class="tree-point" v-if="task.users.length > 3"
                          >...</span
                        >
                      </template>
                      <img
                        v-else
                        class="user-avatar"
                        :src="UsersEmptyIcon"
                        alt="Sin usuarios asignados"
                      />
                    </section>
                  </div>
                </div>
              </div>
            </template>
            <section class="empty-tasks-container" v-else>
              <img class="empty-icon" :src="EmptyIcon" alt="No hay tareas" />
            </section>
          </ul>
          <Spinner v-else />
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tree-point {
  height: 3em;
  line-height: 2.5em;
}
.info {
  font-size: 0.8em;
  max-width: 30em;
  color: #616161;
  display: flex;
  align-items: flex-start;
  gap: 0.5em;
  text-align: justify;
}
.info span {
  color: #ff0000;
  font-size: 1.5em;
}
.card-container:hover .card-list-color {
  transform: rotate(-4deg) scale(105%);
}
.card-container:hover .list-inline {
  transform: rotate(8deg) scale(102%);
}
.card-list-color {
  border-radius: 30px 5px 30px 30px;
  transition: 0.25s ease;
}
.tasks-container-style-inner {
  width: inherit;
  background-color: rgba(255, 255, 255, 0);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  min-height: inherit;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 2em 0;
}
.circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  position: absolute;
  transition: 0.25s ease;
}
.circle:nth-child(1) {
  top: -25px;
  left: -25px;
  animation: move-circle-up 2s ease-in infinite alternate-reverse;
}
.circle:nth-child(2) {
  bottom: -25px;
  right: -25px;
  animation: move-circle-down 2s ease-in infinite alternate-reverse;
}
.header-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 5em;
  width: 100%;
  position: relative;
}
.img-background-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
.img-background {
  right: 0;
  width: 32em;
  height: 32em;
  position: absolute;
  z-index: 1;
}
.img-background-blur {
  width: 20em;
  height: 20em;
  position: absolute;
  border-radius: 50%;
  filter: blur(150px);
  right: 118px;
  position: absolute;
  transition: 0.25s ease;
}
.tasks-container-style {
  border-radius: 20px;
  box-shadow: 5px 5px 20px -8px black;
  width: 80vw;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 20em;
  position: relative;
}
.filter-active {
  transform: scale(1.3);
}
.clear-filter {
  width: 1.4em;
  height: 1.4em;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid black;
  padding: 0.2em;
  transition: 0.25s ease;
}
.clear-filter:hover {
  transform: scale(1.3);
}
.filters-container {
  display: flex;
  gap: 1em;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  z-index: 1;
  max-width: 90%;
}
.color {
  width: 2em;
  height: 2em;
  border-radius: 50%;
  cursor: pointer;
  transition: 0.25s ease;
}
.color:hover {
  filter: blur(2px);
}
.list-inline {
  display: flex;
  position: relative;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 190px;
  height: 254px;
  border-radius: 30px 5px 30px 30px;
  box-shadow: 5px 5px 10px rgb(25, 25, 25), -2px -2px 10px rgb(60, 60, 60);
  cursor: pointer;
  transition: 0.25s ease;
  background: #212121;
  overflow: hidden;
}
.list-inline .span-before {
  position: absolute;
  width: 100px;
  height: 200%;
  animation: rotation_border 5s linear infinite;
}
.list-inline .span-after {
  position: absolute;
  inset: 1px;
  background: #212121;
  border-radius: 30px 5px 30px 30px;
}
.extra-info {
  padding: 0.4em 0;
  height: auto;
  background-color: #313131;
  position: absolute;
  width: 100%;
  bottom: -100%;
  display: flex;
  border-radius: 30px 30px 30px;
  transition: 0.25s ease;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.3em;
  z-index: 1;
}
.list-inline:hover .extra-info {
  bottom: 0;
  transition: 0.25s ease;
}
.delete-icon {
  display: flex;
  cursor: pointer;
  width: 0.8em;
  height: 0.8em;
  transition: transform 0.5s ease;
  filter: grayscale(1);
}
.delete-icon:hover {
  transform: rotate(360deg);
}
.delete-icon:active {
  transform: scale(130%);
}
.add-task-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2em;
  max-width: 50em;
  align-items: flex-start;
}
button {
  padding: 0.3em 2em;
  background-color: #ffffff0f;
  color: #ffffffde;
  border: none;
  border-radius: 5px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  height: 3.5em;
  transition: all 0.35s ease;
}
button span {
  z-index: 2;
  position: relative;
  font-size: 1.1em;
}

button::after {
  content: "";
  width: 100%;
  position: absolute;
  top: 0px;
  left: calc(-100% - 40px);
  transition: 0.35s ease;
  border-right: 40px solid transparent;
  z-index: 1;
}
.ad-task-container__btn::after {
  border-bottom: 3.5em solid v-bind(`${store.color}24`);
}
.ad-task-container__btn:hover {
  box-shadow: 0px 0px 7px -2px v-bind("store.color");
}
button:hover::after {
  left: 0;
}
.delete-all-task-container__btn::after {
  border-bottom: 2.6em solid #fe000024;
}
.delete-all-task-container__btn:hover {
  box-shadow: 0px 0px 10px -3px #fe0000;
}
.panel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 25em;
  justify-content: center;
  gap: 4em;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 8em 1em 5em;
  margin: 0 auto;
  width: 80vw;
}
.list-inline .spinner {
  width: 1em;
  height: 1em;
}
.list-inline .spinner::after {
  width: 1em;
  height: 1em;
}
.empty-icon {
  width: 12em;
  height: 12em;
}
.empty-tasks-container {
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 5em;
  justify-content: center;
}

.actions-container {
  display: flex;
  gap: 1em;
  flex-direction: row-reverse;
  align-items: center;
  position: absolute;
  top: 7px;
  right: 7px;
  z-index: 1;
}
@keyframes rotation_border {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
@keyframes move-circle-up {
  to {
    transform: translateY(10px);
  }
}
@keyframes move-circle-down {
  to {
    transform: translateY(-10px);
  }
}
@media (max-width: 1000px) {

  .extra-info{
    gap: 0.6em;
  }
  .tasks-container-style {
    width: 80vw;
  }
  .list-inline {
    width: 50vw;
  }
  .header-container {
    flex-wrap: wrap;
    gap: 1em;
    text-align: center;
    margin-top: 1em;
    justify-content: center;
  }
  .img-background {
    width: 16em;
    height: 16em;
    position: relative;
  }
  .img-background-blur {
    width: 10em;
    height: 10em;
    right: 60px;
  }
  .img-background-container {
    margin-top: 2em;
  }
  h1 {
    font-size: 2.4em;
    white-space: pre-wrap;
    font-weight: 700;
  }
  h6 {
    font-size: 1.1em;
    font-weight: 500;
  }
  .add-task-container {
    align-items: center;
  }
  .panel-container {
    padding: 8em 0em 2em;
  }

  .empty-icon {
    width: 7em;
    height: 7em;
  }
}
</style>
