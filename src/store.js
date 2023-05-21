import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAuthUserStore = defineStore("authUser", () => {
  const user = ref(null);
  const users_selected = ref([]);
  const loading = ref(false);
  const filters_selected = ref(["00ffaa"]);

  const color = computed(() => {
    const length = filters_selected.value.length;
    if (length === 2) {
      return filters_selected.value[1];
    } else if (length > 2 || length === 1) {
      return filters_selected.value[0];
    }
  });

  return { user, users_selected, loading, filters_selected, color };
});
