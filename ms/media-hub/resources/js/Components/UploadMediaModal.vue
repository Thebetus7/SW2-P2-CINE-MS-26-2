<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
    <div class="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full p-6 text-white">
      <!-- Encabezado -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 class="text-lg font-bold flex items-center gap-2">
          <span>🎬</span> Subir Afiche a MinIO Storage
        </h3>
        <button @click="closeModal" class="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
      </div>

      <!-- Zona Drag & Drop -->
      <div class="my-5">
        <div 
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleFileDrop"
          class="border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer"
          :class="isDragging ? 'border-indigo-400 bg-indigo-950/30' : 'border-slate-700 hover:border-slate-500 bg-slate-950/40'"
          @click="triggerFileInput">
          
          <input 
            type="file" 
            ref="fileInputRef" 
            accept="image/jpeg,image/png,image/webp" 
            class="hidden" 
            @change="handleFileSelect" />

          <div v-if="!selectedFile" class="space-y-2">
            <span class="text-3xl">📁</span>
            <p class="text-sm font-medium text-slate-300">Arrastre un archivo aquí o haga clic para explorar</p>
            <p class="text-xs text-slate-500">Formatos permitidos: JPEG, PNG, WEBP (Máximo 5 MB)</p>
          </div>

          <div v-else class="flex flex-col items-center gap-3">
            <img v-if="previewUrl" :src="previewUrl" alt="Previsualización" class="w-32 h-44 object-cover rounded-lg shadow-md border border-slate-700" />
            <div class="text-xs text-slate-300 text-center">
              <strong class="text-white block">{{ selectedFile.name }}</strong>
              <span>{{ (selectedFile.size / (1024 * 1024)).toFixed(2) }} MB</span>
            </div>
            <button 
              type="button" 
              @click.stop="clearSelection" 
              class="text-xs text-rose-400 hover:text-rose-300 underline">
              Cambiar archivo
            </button>
          </div>
        </div>

        <!-- Banner de Error -->
        <div v-if="errorMessage" class="mt-3 p-3 bg-red-950/80 border border-red-800 text-red-200 rounded-lg text-xs flex items-center gap-2">
          <span>⚠️</span> {{ errorMessage }}
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
        <button 
          type="button" 
          @click="closeModal" 
          class="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 transition">
          Cancelar
        </button>
        <button 
          type="button" 
          :disabled="!selectedFile || isUploading"
          @click="uploadFile" 
          class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-900/30 transition flex items-center gap-2">
          <span v-if="isUploading" class="animate-spin">⏳</span>
          <span>{{ isUploading ? 'Subiendo a MinIO...' : 'Subir y Generar Miniatura' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  movieId: {
    type: String,
    default: 'mov-001'
  }
});

const emit = defineEmits(['close', 'uploaded']);

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

const fileInputRef = ref(null);
const isDragging = ref(false);
const selectedFile = ref(null);
const previewUrl = ref('');
const errorMessage = ref('');
const isUploading = ref(false);

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const validateAndSetFile = (file) => {
  errorMessage.value = '';
  if (!file) return;

  if (file.size > MAX_SIZE_BYTES) {
    errorMessage.value = `El archivo supera el límite de 5 MB (${(file.size / (1024 * 1024)).toFixed(2)} MB).`;
    selectedFile.value = null;
    previewUrl.value = '';
    return;
  }

  if (!ALLOWED_MIME.includes(file.type.toLowerCase())) {
    errorMessage.value = `Tipo de archivo no permitido: ${file.type}. Solo se aceptan JPEG, PNG o WEBP.`;
    selectedFile.value = null;
    previewUrl.value = '';
    return;
  }

  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
};

const handleFileSelect = (event) => {
  const file = event.target.files?.[0];
  validateAndSetFile(file);
};

const handleFileDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  validateAndSetFile(file);
};

const clearSelection = () => {
  selectedFile.value = null;
  previewUrl.value = '';
  errorMessage.value = '';
};

const closeModal = () => {
  clearSelection();
  emit('close');
};

const uploadFile = () => {
  if (!selectedFile.value) return;
  isUploading.value = true;

  setTimeout(() => {
    isUploading.value = false;
    emit('uploaded', {
      name: selectedFile.value.name,
      size: selectedFile.value.size,
      mime: selectedFile.value.type,
      movieId: props.movieId
    });
    closeModal();
  }, 500);
};
</script>
