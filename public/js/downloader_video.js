const typeSelect = document.querySelector(".select-res.type");
const modelSelect = document.querySelector(".select-res.model");
const queryInput = document.querySelector(".input-res.query");
const resultDiv = document.getElementById("result");
const loading = document.getElementById("loading");
const apiKey = document.querySelector('meta[name="apikey"]')?.getAttribute('content') || "";

let apis = [];

async function loadApis() {
  try {
    const res = await fetch("/api/v3/apis/sections/Download/api");
    const json = await res.json();
    apis = json.data;

    const tags = [...new Set(apis.map(api => api.tag))];
    tags.forEach(tag => {
      const opt = document.createElement("option");
      opt.value = tag;
      opt.textContent = tag;
      typeSelect.appendChild(opt);
    });
  } catch (err) {
    alert("Error loading APIs: " + err.message);
  }
}

typeSelect.addEventListener("change", () => {
  modelSelect.innerHTML = '<option disabled selected>Select model...</option>';
  const filtered = apis.filter(api => api.tag === typeSelect.value);
  filtered.forEach(api => {
    const opt = document.createElement("option");
    opt.value = api.model;
    opt.textContent = api.model;
    modelSelect.appendChild(opt);
  });
});

async function handleDownload() {
  const type = typeSelect.value;
  const model = modelSelect.value;
  const query = queryInput.value.trim();

  if (!type || !model || !query) {
    return alert("Please fill all fields.");
  }

  const selectedApi = apis.find(api => api.tag === type && api.model === model);
  if (!selectedApi) return alert("Model not found.");

  const queryKey = Object.keys(selectedApi.query)[0];
  const apiUrl = selectedApi.url.startsWith("http://")
    ? selectedApi.url.replace("http://", "https://")
    : selectedApi.url;
  const url = `${apiUrl}?${queryKey}=${encodeURIComponent(query)}`;

  loading.style.display = "block";
  resultDiv.innerHTML = "";

  try {
    const res = await fetch(url, {
      headers: {
        'api-key': apiKey
      }
    });

    const json = await res.json();
    loading.style.display = "none";

    if (!json.status || !json.data) {
      resultDiv.innerHTML = "<p>No valid data found.</p>";
      return;
    }

    const container = renderData(json.data);
    resultDiv.appendChild(container);
  } catch (err) {
    loading.style.display = "none";
    resultDiv.innerHTML = `<p>Error: ${err.message}</p>`;
  }
}

function renderData(obj) {
  const container = document.createElement("div");
  container.className = "media-block";

  let info = "";
  const infoList = [];
  const media = { thumb: "", image: "", video: "", audio: "" };
  const downloads = [];

  const renderMedia = (type, val) => {
    (Array.isArray(val) ? val : [val]).forEach((v, i) => {
      if (!v) return;
      const element = {
        thumb: `<img class="img-res" src="${v}" alt="Thumbnail" />`,
        image: `<img class="img-res" src="${v}" alt="Image" />`,
        video: `<video class="video-res" src="${v}" controls></video>`,
        audio: `<audio class="audio-res" src="${v}" controls></audio>`
      }[type];
      media[type] += element;
      downloads.push({ label: `${type.toUpperCase()} ${i + 1}`, url: v });
    });
  };

  for (const key in obj) {
    const val = obj[key];
    if (!val) continue;
    const k = key.toLowerCase();
    if (k.includes("thumb")) renderMedia("thumb", val);
    else if (k.includes("image")) renderMedia("image", val);
    else if (k.includes("video")) renderMedia("video", val);
    else if (k.includes("audio")) renderMedia("audio", val);
    else {
      if (typeof val === "object") {
        for (const sub in val) {
          infoList.push({ label: `${key}.${sub}`, value: val[sub] });
        }
      } else {
        infoList.push({ label: key, value: val });
      }
    }
  }

  const mediaGroup = document.createElement("div");
  mediaGroup.className = "media-group";
  mediaGroup.innerHTML = media.thumb + media.image + media.video + media.audio;
  container.appendChild(mediaGroup);

  const infoBlock = document.createElement("div");
  infoBlock.className = "info";

  infoList.forEach(({ label, value }) => {
    const labelElement = document.createElement("strong");
    labelElement.textContent = `${label}:`;
    const valueElement = document.createElement("span");
    valueElement.textContent = value;

    const row = document.createElement("div");
    row.className = "info-row";
    row.appendChild(labelElement);
    row.appendChild(valueElement);
    infoBlock.appendChild(row);
  });

  container.appendChild(infoBlock);

  if (downloads.length > 0) {
    const downloadDiv = document.createElement("div");
    downloadDiv.className = "download-select";
    downloads.forEach(({ label, url }) => {
      const btn = document.createElement("button");
      btn.className = "button-res";
      btn.textContent = `Download ${label}`;
      btn.onclick = () => window.open(url, "_blank");
      downloadDiv.appendChild(btn);
    });
    container.appendChild(downloadDiv);
  }

  container.style.animation = "fadeIn 1s forwards";
  return container;
}

loadApis();
