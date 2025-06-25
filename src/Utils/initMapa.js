import L from "leaflet";
import dinoFoto from "../assets/dinoFoto.jpg";

export function initMapa(elementId, camadaRefs) {
  const map = criarMapaBase(elementId);
  criarCamadasWMS(map, camadaRefs);
  registrarEventoDeClique(map, camadaRefs.fosseis, camadaRefs.museus);
  return map;
}

function criarMapaBase(elementId) {
  const map = L.map(elementId, {
    center: [-15.8, -47.9],
    zoom: 4,
    minZoom: 3,
    maxZoom: 12,
  });

  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution: "Tiles © Esri",
    }
  ).addTo(map);

  return map;
}

function criarCamadasWMS(map, camadaRefs) {
  camadaRefs.uf = L.tileLayer
    .wms("http://localhost:8080/geoserver/projeto_fosseis_br/wms", {
      layers: "projeto_fosseis_br:uf",
      format: "image/png",
      transparent: true,
      version: "1.1.1",
    })
    .addTo(map)
    .setZIndex(100);

     camadaRefs.lim_mun = L.tileLayer
    .wms("http://localhost:8080/geoserver/projeto_fosseis_br/wms", {
      layers: "projeto_fosseis_br:limite_muni",
      format: "image/png",
      transparent: true,
      version: "1.1.1",
    })
    .addTo(map)
    .setZIndex(200);

    camadaRefs.geologia_brasil = L.tileLayer
    .wms("http://localhost:8080/geoserver/projeto_fosseis_br/wms", {
      layers: "projeto_fosseis_br:geologia_brasil",
      format: "image/png",
      transparent: true,
      version: "1.1.1",
    })
    .addTo(map)
    .setZIndex(300);

  camadaRefs.fosseis = L.tileLayer
    .wms("http://localhost:8080/geoserver/projeto_fosseis_br/wms", {
      layers: "projeto_fosseis_br:fosseis_br",
      format: "image/png",
      transparent: true,
      version: "1.1.1",
    })
    .addTo(map)
    .setZIndex(400);

  camadaRefs.museus = L.tileLayer
    .wms("http://localhost:8080/geoserver/projeto_fosseis_br/wms", {
      layers: "projeto_fosseis_br:museus_centrospesq",
      format: "image/png",
      transparent: true,
      version: "1.1.1",
    })
    .addTo(map)
    .setZIndex(500);
}

function registrarEventoDeClique(map, camadaFosseis, camadaMuseus) {
  map.on("click", async function (e) {
    const latlng = e.latlng;

    const urlFosseis = getFeatureInfoUrl(camadaFosseis, latlng, map);
    const urlMuseus = getFeatureInfoUrl(camadaMuseus, latlng, map);

    try {
      const [resFosseis, resMuseus] = await Promise.all([
        fetch(urlFosseis).then(r => r.text()),
        fetch(urlMuseus).then(r => r.text()),
      ]);

      const contentFosseis = montarPopupFeatureInfo(resFosseis, "fossil");
      const contentMuseus = montarPopupFeatureInfo(resMuseus, "museu");

      const finalContent =
        contentFosseis + contentMuseus ||
        "<p>Clique no mapa para ver os dados.</p>";

      document.getElementById("info-content").innerHTML = finalContent;
    } catch (err) {
      console.error(err);
      document.getElementById("info-content").innerHTML =
        "<i>Erro ao obter os dados.</i>";
    }
  });
}


function getFeatureInfoUrl(layer, latlng, map) {
  const point = map.latLngToContainerPoint(latlng, map.getZoom());
  const size = map.getSize();

  const params = {
    request: "GetFeatureInfo",
    service: "WMS",
    srs: "EPSG:4326",
    styles: "",
    transparent: true,
    version: "1.1.1",
    format: "image/png",
    bbox: map.getBounds().toBBoxString(),
    height: size.y,
    width: size.x,
    layers: layer.wmsParams.layers,
    query_layers: layer.wmsParams.layers,
    info_format: "text/html",
    feature_count: 5,
    x: Math.floor(point.x),
    y: Math.floor(point.y),
  };

  return `${layer._url}?${new URLSearchParams(params).toString()}`;
}

function montarPopupFeatureInfo(htmlText, tipo) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");
  const rows = doc.querySelectorAll("table.featureInfo tr");

  if (rows.length === 0) return "";

  const titlesFosseis = {
    occurrence: "Ocorrência",
    accepted_n: "Nome Aceito",
    genus: "Gênero",
    state: "Estado",
    county: "Município",
    environmen: "Ambiente",
  };

  const titlesMuseus = {
    nome: "Nome",
    cidade: "Cidade",
    estado: "Estado",
    tipo: "Tipo",
  };

  const wantedAttrs = tipo === "fossil"
    ? Object.keys(titlesFosseis)
    : Object.keys(titlesMuseus);

  const titlesPT = tipo === "fossil" ? titlesFosseis : titlesMuseus;

  let content = "";

  const headers = Array.from(rows[0]?.querySelectorAll("th") || []).map(th =>
    th.textContent.trim()
  );
  const indices = wantedAttrs.map(attr => headers.indexOf(attr));

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll("td");
    content += `<div class="popup-card">`;

    // Só mostra imagem para fósseis
    if (tipo === "fossil") {
      content += `
        <div class="popup-img">
          <img src="${dinoFoto}" alt="Dino"/>
        </div>`;
    }

    content += `<div class="popup-info">`;
    wantedAttrs.forEach((attr, idx) => {
      const cellIndex = indices[idx];
      if (cellIndex >= 0) {
        const val = cells[cellIndex]?.textContent || "N/A";
        content += `
          <div class="popup-row">
            <span class="popup-key">${titlesPT[attr]}:</span>
            <span class="popup-value">${val}</span>
          </div>`;
      }
    });

    content += `</div></div><hr>`;
  }

  return content;
}

