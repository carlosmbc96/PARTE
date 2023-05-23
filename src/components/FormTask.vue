<script setup>
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { createToast } from "mosha-vue-toastify";
import { computed, ref, watch } from "vue";
import CheckIcon from "../assets/check_icon.png";
import CloseIcon from "../assets/delete_icon.png";
import InformationIcon from "../assets/information_icon.png";
import { db } from "../firebase";
import typeNotification from "../notificationConfig";
import { useAuthUserStore } from "../store";
import Spinner from "./Spinner.vue";
import UsersCard from "./UsersCard.vue";

const props = defineProps(["show", "taskProp", "action"]);
const emit = defineEmits(["reload", "onCloseModal"]);

const task = ref({ title: null, color: "#00ffaa" });
const modal = ref(null);
const loading = ref(false);
const store = useAuthUserStore();

watch(
  () => props.show,
  () => {
    props.show && modal.value.showModal();
    task.value = props.taskProp;
    props.action === "EDIT" &&
      props.show &&
      (store.users_selected = [...task.value.users]);
    store.filters_selected.length === 2 &&
      (task.value.color = store.filters_selected[1]);
  }
);

const disableAction = computed(() => {
  return (
    task.value.title &&
    task.value.title.trim() &&
    store.users_selected.length !== 0
  );
});

const closeModal = () => {
  modal.value.close();
  store.loading = true;
  store.users_selected = [];
  task.value.color = "#000000";
  task.value.title = null;
  task.value.users = [];
  emit("onCloseModal");
};

const addTask = async () => {
  task.value.users = "users" in task.value ? task.value.users : [];
  let action = null;
  loading.value = true;
  try {
    if (props.action === "EDIT") {
      // Editar
      action = "editada";
      const taskRef = doc(db, "tasks", task.value.id);
      await updateDoc(taskRef, task.value);
    } else {
      action = "creada";
      // Crear
      await addDoc(collection(db, "tasks"), task.value);
    }
    const { msg, config } = typeNotification(
      `La tarea ha sido ${action} correctamente.`
    ).success;
    createToast(msg, config);
    emit("reload");
  } catch (error) {
    const { msg, config } = typeNotification(
      `La tarea no ha podido ser ${action}.`
    ).danger;
    createToast(msg, config);
  } finally {
    closeModal();
    loading.value = false;
  }
};

const selectUsers = () => {
  task.value.users = store.users_selected;
};
</script>

<template>
  <dialog
    :class="{ 'modal-open': props.show }"
    @cancel="closeModal"
    class="modal"
    ref="modal"
  >
    <h2>
      {{
        props.action === "EDIT"
          ? "Edita la tarea..."
          : "Crea una nueva tarea..."
      }}
    </h2>
    <span class="hint">
      <img :src="InformationIcon" alt="Informacion" />
      Debes asignarte a ti mismo la tarea para poder verla</span
    >
    <img
      title="Cerrar ventana"
      class="close"
      :src="CloseIcon"
      alt="Cerrar modal"
      @click="closeModal"
    />
    <div class="create-task-container">
      <input type="color" class="input-color" v-model="task.color" />
      <div class="input-container">
        <div class="input-span">
          <input
            class="input-new-task"
            placeholder="Tarea..."
            type="text"
            v-model="task.title"
          />
          <span></span>
        </div>
        <Transition mode="out-in">
          <img
            v-if="!loading"
            title="Crear tarea"
            :class="{ disable: !disableAction }"
            @click="addTask"
            class="create-icon"
            :src="CheckIcon"
            alt="Crear tarea"
          />
          <Spinner v-else />
        </Transition>
      </div>
    </div>
    <UsersCard @selected_users="selectUsers" />
  </dialog>
</template>

<style scoped>
.input-span {
  position: relative;
}
.input-container .spinner {
  width: 2em;
  height: 2em;
}
.input-container .spinner::after {
  width: 2em;
  height: 2em;
}
.input-color {
  border: none;
  background-color: transparent;
  width: 4em;
  height: 4em;
  border-radius: 5px;
  box-shadow: 0 0 10px -1px v-bind("task.color");
}
.input-color::-webkit-color-swatch {
  border-radius: 3px;
  border: none;
  cursor: pointer;
}
.modal::backdrop {
  background-color: #000000b3;
  backdrop-filter: blur(20px);
}
.modal {
  border-radius: 5px;
  border: 0;
  background-color: #101010;
  opacity: 0;
  transition: opacity 0.5s ease;
  box-shadow: 7px 7px 20px -15px #00ffaa;
}
.modal-open {
  opacity: 1;
}
.input-new-task {
  width: 30em;
  height: 4em;
  border: 0;
  border-radius: 5px;
  padding: 0 1em;
  transition: box-shadow 0.25s ease;
  font-weight: 300;
  font-size: 0.9em;
  outline: none;
  background-color: transparent;
  box-shadow: 0px 4px 16px -10px black;
  position: relative;
}
.input-new-task + span {
  bottom: 0;
  position: absolute;
  left: 0;
  width: 0;
  height: 0.1em;
  border-radius: 0 0 5px 5px;
  background-color: transparent;
  transition: all 0.5s ease-in-out;
}
.input-new-task:focus-visible + span {
  right: 0;
  width: 100%;
  transition: all 0.5s ease-in-out;
  background-color: #02ffaa;
}
.create-icon {
  width: 2em;
  height: 2em;
  cursor: pointer;
  transition: 0.25s ease;
}
.create-icon:hover {
  transform: scale(130%);
}
.create-task-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 1em;
  margin-bottom: 1em;
  margin-top: 0.6em;
  flex-wrap: wrap;
}
.disable {
  pointer-events: none;
  opacity: 0.2;
}
.close {
  position: absolute;
  top: 0;
  right: 0;
  margin: 0.4em 0.5em 0 0;
  width: 0.8em;
  height: 0.8em;
  cursor: pointer;
  transition: transform 0.5s ease;
  filter: grayscale(1);
}
.close:hover {
  transform: rotate(360deg);
}
.input-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1em;
}
.hint {
  font-size: 0.7em;
  color: gray;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5em;
  flex-wrap: wrap;
}
.hint img {
  width: 2em;
  height: 2em;
  filter: contrast(0.5);
}

@media (max-width: 600px) {
  .input-container {
    width: 100%;
    flex-wrap: wrap;
  }
  .input-span {
    width: 100%;
  }
  .input-new-task {
    width: 90%;
  }
  .modal {
    max-width: 80vw;
  }
}
</style>
