<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 text-white space-y-4">
      <div class="flex items-center gap-3">
        <span class="text-3xl shrink-0">{{ icon }}</span>
        <div>
          <h3 class="text-base font-bold text-white">{{ title }}</h3>
          <p class="text-xs text-slate-300 mt-1 leading-relaxed">{{ message }}</p>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <button 
          type="button" 
          @click="$emit('cancel')" 
          class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition">
          {{ cancelText }}
        </button>
        <button 
          type="button" 
          @click="$emit('confirm')" 
          class="px-5 py-2 text-white text-xs font-bold rounded-xl shadow-lg transition"
          :class="isDanger ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/30' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30'">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: '¿Confirmar acción?'
  },
  message: {
    type: String,
    default: 'Esta operación no se puede deshacer.'
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  icon: {
    type: String,
    default: '⚠️'
  },
  isDanger: {
    type: Boolean,
    default: false
  }
});

defineEmits(['confirm', 'cancel']);
</script>
