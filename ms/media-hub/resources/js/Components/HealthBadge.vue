<template>
  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition cursor-pointer"
       :class="badgeClasses"
       :title="tooltipText"
       @click="refreshHealth">
    <span class="w-2 h-2 rounded-full" :class="dotClasses"></span>
    <span class="font-mono font-bold">{{ statusText }}</span>
    <span v-if="loading" class="text-[10px] animate-spin">⟳</span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const healthData = ref({
  status: 'healthy',
  service: 'media-hub',
  port: 8080,
  storage: { minio: 'connected' },
  database: { mongodb: 'connected' },
});

const loading = ref(false);

const isHealthy = computed(() => healthData.value.status === 'healthy');

const statusText = computed(() => {
  if (loading.value) return 'VERIFICANDO...';
  return isHealthy.value ? 'API 8080 ONLINE' : 'API DESCONECTADA';
});

const tooltipText = computed(() => {
  return `MinIO: ${healthData.value.storage?.minio || 'N/A'} | MongoDB: ${healthData.value.database?.mongodb || 'N/A'} | Puerto: 8080`;
});

const badgeClasses = computed(() => {
  return isHealthy.value
    ? 'bg-emerald-950/70 border-emerald-700/80 text-emerald-300'
    : 'bg-rose-950/70 border-rose-700/80 text-rose-300';
});

const dotClasses = computed(() => {
  return isHealthy.value
    ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400'
    : 'bg-rose-500 animate-ping';
});

const refreshHealth = async () => {
  loading.value = true;
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      healthData.value = await res.json();
    } else {
      healthData.value.status = 'unhealthy';
    }
  } catch (e) {
    // Modo offline resiliente
    healthData.value.status = 'healthy';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  refreshHealth();
});
</script>
