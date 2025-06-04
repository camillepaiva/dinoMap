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
  </div>
</template>

<script setup>
import { onMounted, reactive } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

let map;
const camadaRefs = {
  uf: null,
  lim_mun: null,
  fosseis: null,
  museus: null,
};

const layers = reactive({
  uf: true,
  lim_mun: true,
  fosseis: true,
  museus: true,
});

const toggleLayer = (layerName) => {
  const layer = camadaRefs[layerName];
  if (!layer) return;

  if (layers[layerName]) {
    map.addLayer(layer);
    switch (layerName) {
      case "uf":
        layer.setZIndex(100);
        break;
      case "lim_mun":
        layer.setZIndex(200);
        break;
      case "fosseis":
        layer.setZIndex(300);
        break;
      case "museus":
        layer.setZIndex(400);
        break;
    }
  } else {
    map.removeLayer(layer);
  }
};

onMounted(() => {
    map = L.map("map", {
      center: [-15.8, -47.9],
      zoom: 4,
      minZoom: 3,
      maxZoom: 12
    });

  // Mapa base
  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution: "Tiles &copy; Esri",
    }
  ).addTo(map);

  // Camadas WMS
  camadaRefs.uf = L.tileLayer
    .wms("http://localhost:8080/geoserver/projeto_fosseis_br/wms", {
      layers: "projeto_fosseis_br:uf",
      format: "image/png",
      transparent: true,
      version: "1.1.1",
    })
    .addTo(map)
    .setZIndex(100);

  //Limites Municipal do Brasil
  camadaRefs.lim_mun = L.tileLayer
    .wms("http://localhost:8080/geoserver/projeto_fosseis_br/wms", {
      layers: "projeto_fosseis_br:limite_muni",
      format: "image/png",
      transparent: true,
      version: "1.1.1",
    })
    .addTo(map)
    .setZIndex(200);

  camadaRefs.fosseis = L.tileLayer
    .wms("http://localhost:8080/geoserver/projeto_fosseis_br/wms", {
      layers: "projeto_fosseis_br:fosseis_br",
      format: "image/png",
      transparent: true,
      version: "1.1.1",
    })
    .addTo(map)
    .setZIndex(300);

  camadaRefs.museus = L.tileLayer
    .wms("http://localhost:8080/geoserver/projeto_fosseis_br/wms", {
      layers: "projeto_fosseis_br:museus_centrospesq",
      format: "image/png",
      transparent: true,
      version: "1.1.1",
    })
    .addTo(map)
    .setZIndex(400);

  map.on("click", function (e) {
    // Coordenadas do clique
    const latlng = e.latlng;

    // Usa camada que quer consultar, por exemplo camadaRefs.fosseis
    const wmsLayer = camadaRefs.fosseis;

    // Monta a URL do GetFeatureInfo
    const url = getFeatureInfoUrl(wmsLayer, latlng);

    // Faz o fetch para pegar as informações
    fetch(url)
      .then((response) => response.text())
      .then((data) => {
        // Mostra resultado num popup
        L.popup().setLatLng(latlng).setContent(data).openOn(map);
      })
      .catch((err) => console.error(err));
  });

  // Função que cria a URL do GetFeatureInfo
  function getFeatureInfoUrl(layer, latlng) {
    const point = map.latLngToContainerPoint(latlng, map.getZoom());
    const size = map.getSize();

    const baseUrl = layer._url; // URL base do WMS (ex: http://localhost:8080/geoserver/projeto_fosseis_br/wms)
    const params = {
      request: "GetFeatureInfo",
      service: "WMS",
      srs: "EPSG:4326", // ou 'EPSG:3857' dependendo do seu mapa e camada
      styles: "",
      transparent: true,
      version: "1.1.1",
      format: "image/png",
      bbox: map.getBounds().toBBoxString(),
      height: size.y,
      width: size.x,
      layers: layer.wmsParams.layers,
      query_layers: layer.wmsParams.layers,
      info_format: "text/html", // pode ser text/plain, application/json, etc
      feature_count: 5,
      x: Math.floor(point.x),
      y: Math.floor(point.y),
    };

    const queryString = new URLSearchParams(params).toString();
    return baseUrl + "?" + queryString;
  }
});
</script>

<style scoped>
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
  font-family: 'Segoe UI', sans-serif;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 12px 24px;
  border-radius: 12px;
  border: 2px solid #3C8C59;
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
  height: 220px;
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

/* Oculta o checkbox padrão */
.checkbox-container input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

/* Cria caixa customizada */
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

/* Marcado */
.checkbox-container input[type="checkbox"]:checked + span::before {
  background-color: #3c8c59;
  border-color: #3c8c59;
}

/* Ícone de check */
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
</style>
