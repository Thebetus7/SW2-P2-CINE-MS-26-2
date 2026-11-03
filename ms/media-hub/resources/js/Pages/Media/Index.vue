<template>
  <div class="min-h-screen bg-slate-950 text-white p-6 space-y-6">
    <!-- Barra superior de navegación, identificación de módulo y semáforo de salud -->
    <header class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
      <div class="flex items-center gap-3">
        <ActiveModuleBadge />
        <HealthBadge />
      </div>

      <div class="flex items-center gap-3">
        <a 
          href="/pos/candy-scan" 
          class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm">
          <span>🍿</span> Ir a Terminal POS Candy
        </a>
        <button 
          @click="isUploadModalOpen = true" 
          class="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-900/30 transition flex items-center gap-2">
          <span>➕</span> Nuevo Activo (< 5MB)
        </button>
      </div>
    </header>

    <!-- Encabezado de la página -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black tracking-tight flex items-center gap-2">
          <span>🎞️</span> Repositorio Multimedia de Afiches (MinIO S3)
        </h1>
        <p class="text-xs text-slate-400 mt-1">
          Almacenamiento de alta disponibilidad, generación de miniaturas automáticas (300x450) y URLs prefirmadas.
        </p>
      </div>

      <!-- Buscador diacrítico en tiempo real (RF-UX-05) -->
      <div class="relative w-full md:w-80">
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Buscar afiche o película..." 
          class="w-full bg-slate-900 border border-slate-700/80 focus:border-red-500 rounded-xl px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none transition shadow-inner font-medium" />
        <span class="absolute left-3 top-2.5 text-xs text-slate-500">🔍</span>
        <button 
          v-if="searchQuery" 
          @click="searchQuery = ''" 
          class="absolute right-3 top-2 text-xs text-slate-400 hover:text-white">
          &times;
        </button>
      </div>
    </div>

    <!-- Tabla Cebra de Afiches con Botones Explícitos (RF-UX-04) -->
    <div class="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      <div class="p-4 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>Mostrando <strong class="text-white">{{ filteredAssets.length }}</strong> de {{ assets.length }} afiches</span>
        <span class="font-mono text-[11px]">Storage: <strong class="text-cyan-400">MinIO S3 (cinema-assets)</strong></span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th class="py-3.5 px-4">Miniatura (300x450)</th>
              <th class="py-3.5 px-4">Película / Archivo Original</th>
              <th class="py-3.5 px-4">Formato</th>
              <th class="py-3.5 px-4">Tamaño</th>
              <th class="py-3.5 px-4">Dimensiones</th>
              <th class="py-3.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            <tr 
              v-for="(asset, idx) in filteredAssets" 
              :key="asset.id" 
              :class="idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-950/40'"
              class="hover:bg-slate-800/40 transition">
              <td class="py-3 px-4">
                <img 
                  :src="asset.thumbnailUrl" 
                  :alt="asset.originalName" 
                  class="w-12 h-16 object-cover rounded-lg border border-slate-700/80 shadow-md transition transform hover:scale-110" />
              </td>
              <td class="py-3 px-4">
                <strong class="text-white text-sm block">{{ asset.originalName }}</strong>
                <span class="text-slate-500 text-[11px] font-mono">{{ asset.filename }}</span>
              </td>
              <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-rose-300 uppercase border border-slate-700">
                  {{ (asset.mimeType || 'jpeg').split('/')[1] || 'jpeg' }}
                </span>
              </td>
              <td class="py-3 px-4 text-slate-300 font-medium">
                {{ (asset.sizeBytes / (1024 * 1024)).toFixed(2) }} MB
              </td>
              <td class="py-3 px-4 text-slate-400 font-mono text-[11px]">
                {{ asset.dimensions }}
              </td>
              <td class="py-3 px-4 text-right space-x-2">
                <a 
                  :href="asset.originalUrl" 
                  target="_blank" 
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold transition inline-flex items-center gap-1 shadow-sm">
                  <span>👁️</span> Previsualizar
                </a>
                <button 
                  @click="copyUrl(asset.originalUrl)" 
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-[11px] font-semibold transition inline-flex items-center gap-1 shadow-sm">
                  <span>📋</span> Copiar Enlace
                </button>
                <button 
                  @click="confirmDeactivate(asset)" 
                  class="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 rounded-lg text-[11px] font-semibold transition inline-flex items-center gap-1">
                  <span>✕</span> Desactivar
                </button>
              </td>
            </tr>

            <tr v-if="filteredAssets.length === 0">
              <td colspan="6" class="py-8 text-center text-slate-500 text-xs">
                No se encontraron afiches que coincidan con "{{ searchQuery }}".
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Subida < 5MB (RF-01.1, RB-03.4) -->
    <UploadMediaModal 
      :is-open="isUploadModalOpen" 
      @close="isUploadModalOpen = false" 
      @uploaded="handleUploadedAsset" />

    <!-- Modal de Confirmación de Desactivación -->
    <ConfirmationModal 
      :is-open="isConfirmModalOpen"
      title="¿Desactivar afiche publicitario?"
      :message="`Se ocultará el afiche '${selectedAssetForAction?.originalName}' de la cartelera pública.`"
      confirm-text="Sí, Desactivar"
      cancel-text="Cancelar"
      :is-danger="true"
      @confirm="executeDeactivate"
      @cancel="isConfirmModalOpen = false" />

    <!-- Contenedor global de Toasts (RF-UX-07) -->
    <ToastContainer ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ActiveModuleBadge from '@/Components/ActiveModuleBadge.vue';
import HealthBadge from '@/Components/HealthBadge.vue';
import ToastContainer from '@/Components/ToastContainer.vue';
import ConfirmationModal from '@/Components/ConfirmationModal.vue';
import UploadMediaModal from '@/Components/UploadMediaModal.vue';

const isUploadModalOpen = ref(false);
const isConfirmModalOpen = ref(false);
const selectedAssetForAction = ref(null);
const searchQuery = ref('');
const toastRef = ref(null);

const assets = ref([
  {
    id: 'asset-01',
    movieId: 'mov-001',
    filename: 'poster_dune2_official.jpg',
    originalName: 'Dune: Part Two IMAX Official Poster.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 2450000,
    originalUrl: 'http://localhost:9000/cinema-assets/posters/poster_dune2_official.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300',
    dimensions: '300x450'
  },
  {
    id: 'asset-02',
    movieId: 'mov-002',
    filename: 'gladiator2_laser_4k.jpg',
    originalName: 'Gladiator II 4K Laser.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 3120000,
    originalUrl: 'http://localhost:9000/cinema-assets/posters/gladiator2_laser_4k.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300',
    dimensions: '300x450'
  },
  {
    id: 'asset-03',
    movieId: 'mov-003',
    filename: 'moana2_family.jpg',
    originalName: 'Moana 2 Family Adventure.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 1890000,
    originalUrl: 'http://localhost:9000/cinema-assets/posters/moana2_family.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300',
    dimensions: '300x450'
  }
]);

// Buscador diacrítico (RF-UX-05)
const normalize = (str) =>
  (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const filteredAssets = computed(() => {
  if (!searchQuery.value) return assets.value;
  const q = normalize(searchQuery.value);
  return assets.value.filter(
    (a) => normalize(a.originalName).includes(q) || normalize(a.filename).includes(q)
  );
});

const handleUploadedAsset = (data) => {
  const newAsset = {
    id: `asset-${Date.now().toString().slice(-4)}`,
    movieId: data.movieId,
    filename: `poster_${data.movieId}_${data.name}`,
    originalName: data.name,
    mimeType: data.mime,
    sizeBytes: data.size,
    originalUrl: `http://localhost:9000/cinema-assets/posters/${data.name}`,
    thumbnailUrl: `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300`,
    dimensions: '300x450'
  };

  assets.value.unshift(newAsset);
  toastRef.value?.addToast(
    `Afiche "${data.name}" cargado exitosamente a MinIO S3 con miniatura optimizada (300x450).`,
    'success',
    'Activo Publicado'
  );
};

const copyUrl = (url) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url);
  }
  toastRef.value?.addToast('Enlace copiado al portapapeles.', 'info', 'Copiado');
};

const confirmDeactivate = (asset) => {
  selectedAssetForAction.value = asset;
  isConfirmModalOpen.value = true;
};

const executeDeactivate = () => {
  if (selectedAssetForAction.value) {
    assets.value = assets.value.filter((a) => a.id !== selectedAssetForAction.value.id);
    toastRef.value?.addToast(
      `El afiche '${selectedAssetForAction.value.originalName}' fue desactivado.`,
      'info',
      'Activo Desactivado'
    );
  }
  isConfirmModalOpen.value = false;
  selectedAssetForAction.value = null;
};
</script>
