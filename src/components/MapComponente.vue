<template>
  <div>
    <div class="titulo-principal">
      <h2>🦖 DinoMap: Viagem ao Passado</h2>
      <p>Explore fósseis, museus e limites antigos no mapa interativo</p>
      <p>By Camille e Eliezer</p>
    </div>

    <div class="layer-menu">
      <h3 style="color: rgb(213, 153, 0)">🦕 Camadas do Mapa</h3>
      <hr class="divider" />
      <p style="color: rgb(243, 233, 214)">Selecione as camadas que deseja visualizar:</p>
      <br />
      <div class="layer-options">
        <div class="layer-options">
          <label class="checkbox-container">
            <input type="checkbox" v-model="layers.uf" @change="toggleLayer('uf')" />
            <span></span> UF
          </label>

          <label class="checkbox-container">
            <input
              type="checkbox"
              v-model="layers.lim_mun"
              @change="toggleLayer('lim_mun')"
            />
            <span></span> Limites Municipais
          </label>

          <label class="checkbox-container">
            <input
              type="checkbox"
              v-model="layers.geologia_brasil"
              @change="toggleLayer('geologia_brasil')"
            />
            <span></span> Geologia
          </label>

          <label class="checkbox-container">
            <input
              type="checkbox"
              v-model="layers.fosseis"
              @change="toggleLayer('fosseis')"
            />
            <span></span> Fósseis
          </label>

          <label class="checkbox-container">
            <input
              type="checkbox"
              v-model="layers.museus"
              @change="toggleLayer('museus')"
            />
            <span></span> Museus
          </label>
        </div>
      </div>
    </div>
    <div id="map" class="map-container"></div>
    <div id="info-card" class="info-card">
      <h2>Informações da camada</h2>
      <div id="info-content">Clique no mapa para ver os dados.</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive } from "vue";
import { initMapa } from "../Utils/initMapa.js";
import "leaflet/dist/leaflet.css";

let map;
const camadaRefs = {
  uf: null,
  lim_mun: null,
  geologia_brasil:null,
  fosseis: null,
  museus: null,
};

const layers = reactive({
  uf: true,
  lim_mun: true,
  geologia_brasil: true,
  fosseis: true,
  museus: true,
});

const toggleLayer = (layerName) => {
  const layer = camadaRefs[layerName];
  if (!layer) return;

  if (layers[layerName]) {
    map.addLayer(layer);
    layer.setZIndex(
      {
        uf: 100,
        lim_mun: 200,
        fosseis: 300,
        museus: 400,
      }[layerName]
    );
  } else {
    map.removeLayer(layer);
  }
};

onMounted(() => {
  map = initMapa("map", camadaRefs, layers);
});
</script>

<style>
.map-container {
  height: 100vh;
  width: 100%;
}
.titulo-principal {
  position: absolute;
  top: 2%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 1000;
  color: rgb(213, 153, 0);
  text-shadow: 2px 2px 4px black;
  font-family: "Segoe UI", sans-serif;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 12px 24px;
  border-radius: 12px;
  border: 2px solid #3c8c59;
}
.titulo-principal h1 {
  margin: 0;
  font-size: 28px;
}
.titulo-principal p {
  margin: 5px 0 0;
  font-size: 14px;
  color: wheat;
}

.layer-menu {
  position: absolute;
  top: 15%;
  left: 2%;
  z-index: 1000;
  height: 250px;
  width: 300px;
  background: url("../assets/fundoMenu.png") center/cover no-repeat;
  border: 2px solid #3c8c59;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  font-family: "Segoe UI", sans-serif;
  backdrop-filter: brightness(0.7);
  color: wheat;
}

.divider {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  margin: 10px 0;
}

.layer-menu h3 {
  margin: 0 0 10px;
  font-size: 20px;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
}
.layer-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  font-size: 15px;
  user-select: none;
  color: rgb(243, 233, 214);
  text-shadow: 1px 1px 2px #000;
  padding-left: 28px;
  cursor: pointer;
}

.checkbox-container input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkbox-container::before {
  content: "";
  position: absolute;
  left: 0;
  top: 2px;
  width: 18px;
  height: 18px;
  border: 2px solid white;
  border-radius: 4px;
  background-color: transparent;
  transition: all 0.2s ease;
}

.checkbox-container input[type="checkbox"]:checked + span::before {
  background-color: #3c8c59;
  border-color: #3c8c59;
}

.checkbox-container input[type="checkbox"]:checked + span::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 6px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
.info-card {
  position: fixed;
  top: 70px;
  right: 20px;
  width: 360px;
  max-height: 500px; 
  overflow-y: auto;
  background-color: rgba(0, 0, 0, 0.5);
  border: 2px solid #3c8c59;
  border-radius: 20px;
  padding: 28px 32px;
  font-family: "Montserrat", sans-serif;
  color: #f1e6d0;
  font-size: 13px;
  z-index: 9999;
  user-select: none;
  transition: transform 0.3s ease;
}

.info-card h2 {
  margin-top: 0;
  margin-bottom: 22px;
  font-weight: 900;
  font-size: 24px;
  letter-spacing: 1.3px;
  color: #3c8c59; 
  text-shadow: 0 2px 5px rgba(95, 47, 0, 0.8);
  border-bottom: 3px solid #3c8c59;
  padding-bottom: 8px;
}

.popup-card {
  display: flex;
  gap: 20px;
  margin-bottom: 26px;
  align-items: center;
  padding: 14px 18px;
  box-shadow: inset 0 0 18px rgba(216, 126, 31, 0.3);
  transition: background 0.25s ease;
}

.popup-img img {
  width: 90px;
  height: 110px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid #3c8c59;
  filter: drop-shadow(0 0 6px #3c8c59);
}
.popup-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.popup-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
  word-break: break-word; 
}

.popup-key {
  color: #d87e1f;
  font-size: 13px;
  text-transform: uppercase;
  text-shadow: 0 1.5px 2.5px rgba(30, 17, 0, 0.5);
  min-width: 120px;
  white-space: normal;
}

.popup-value {
  color: #f1e6d0;
  font-size: 13px;
  max-width: 180px;
  text-align: right;
  white-space: normal;    
  overflow-wrap: break-word;
  font-weight: 600;
  font-style: italic;
  flex: 1;
}

.info-card::-webkit-scrollbar {
  width: 10px;
}
.info-card::-webkit-scrollbar-thumb {
  background: #d87e1f;
  border-radius: 15px;
}
.info-card::-webkit-scrollbar-track {
  background: rgba(50, 75, 38, 0.15);
}
</style>
