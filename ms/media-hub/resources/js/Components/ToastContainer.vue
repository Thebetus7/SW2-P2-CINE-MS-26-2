<template>
  <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
    <transition-group name="toast-slide">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-start gap-3 backdrop-blur-md transition-all duration-300"
        :class="getToastClasses(toast.type)">
        
        <span class="text-xl shrink-0">
          {{ toast.type === 'success' ? '✅' : toast.type === 'error' ? '🚫' : 'ℹ️' }}
        </span>

        <div class="flex-1 space-y-0.5">
          <strong class="text-xs font-bold block" :class="getTitleClasses(toast.type)">
            {{ toast.title || (toast.type === 'success' ? 'Operación Exitosa' : 'Aviso del Sistema') }}
          </strong>
          <p class="text-xs text-slate-200 leading-snug">{{ toast.message }}</p>
        </div>

        <button 
          @click="removeToast(toast.id)" 
          class="text-slate-400 hover:text-white text-lg leading-none shrink-0">
          &times;
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const toasts = ref([]);

const addToast = (message, type = 'success', title = '') => {
  const id = Date.now() + Math.random();
  toasts.value.push({ id, message, type, title });

  setTimeout(() => {
    removeToast(id);
  }, 4500);
};

const removeToast = (id) => {
  toasts.value = toasts.value.filter((t) => t.id !== id);
};

const getToastClasses = (type) => {
  if (type === 'success') {
    return 'bg-emerald-950/90 border-emerald-600 text-emerald-100 shadow-emerald-950/50';
  }
  if (type === 'error') {
    return 'bg-rose-950/90 border-rose-600 text-rose-100 shadow-rose-950/50';
  }
  return 'bg-indigo-950/90 border-indigo-600 text-indigo-100 shadow-indigo-950/50';
};

const getTitleClasses = (type) => {
  if (type === 'success') return 'text-emerald-300';
  if (type === 'error') return 'text-rose-300';
  return 'text-indigo-300';
};

defineExpose({
  addToast,
  removeToast
});
</script>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
