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
    resultDiv.innerHTML = `<p>Error: Internet Connection, Please Refresh Page.</p>`;
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

  if (!type) return resultDiv.innerHTML = `<p>Error: Please Select Type Download Video.</p>`;
  else if (!model) return resultDiv.innerHTML = `<p>Error: Please Select Model Download Video.</p>`;
  else if (!query) return resultDiv.innerHTML = `<p>Error: Please Add Url Video.</p>`;

  const selectedApi = apis.find(api => api.tag === type && api.model === model);
  if (!selectedApi) return resultDiv.innerHTML = `<p>Error: Model not found.</p>`;

  const queryKey = Object.keys(selectedApi.query)[0];
  const apiUrl = selectedApi.url.startsWith("http://")
    ? selectedApi.url.replace("http://", "https://")
    : selectedApi.url;
  const url = `${apiUrl}?${queryKey}=${encodeURIComponent(query)}`;

  loading.style.display = "block";
  resultDiv.innerHTML = "";

  try {
    const res = await fetch(url, {
      headers: { 'api-key': apiKey }
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

  const infoList = [];
  const media = { thumb: "", image: "", video: "", audio: "" };
  const downloads = [];

  const renderMedia = (type, val) => {
    (Array.isArray(val) ? val : [val]).forEach((v, i) => {
      if (!v) return;
      const element = {
        thumb: `<img class="thumb-img" src="${v}" />`,
        image: `<img class="media-image hidden" src="${v}" />`,
        video: `<video class="media-video hidden" src="${v}" controls></video>`,
        audio: `<audio class="media-audio hidden" src="${v}" controls></audio>`
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
        for (const sub in val) infoList.push({ label: `${key}.${sub}`, value: val[sub] });
      } else {
        infoList.push({ label: key, value: val });
      }
    }
  }

  const topWrapper = document.createElement("div");
  topWrapper.className = "top-wrapper";

  const thumbDiv = document.createElement("div");
  thumbDiv.className = "thumb-container";
  thumbDiv.innerHTML = media.thumb;

  const infoDiv = document.createElement("div");
  infoDiv.className = "info";
  infoList.forEach(({ label, value }) => {
    const row = document.createElement("div");
    row.className = "info-row";
    row.innerHTML = `<strong>${label}:</strong> <span>${value}</span>`;
    infoDiv.appendChild(row);
  });

  topWrapper.appendChild(thumbDiv);
  topWrapper.appendChild(infoDiv);
  container.appendChild(topWrapper);

  const mediaGroup = document.createElement("div");
  mediaGroup.className = "media-group hidden";
  mediaGroup.innerHTML = media.video + media.audio + media.image;
  container.appendChild(mediaGroup);

  if (media.video || media.audio || media.image) {
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "hide-btn-res";
    toggleBtn.innerHTML = `<i class="fas fa-eye"></i> Show Media`;

    toggleBtn.onclick = () => {
      mediaGroup.classList.toggle("hidden");
      const shown = !mediaGroup.classList.contains("hidden");
      toggleBtn.innerHTML = shown
        ? `<i class="fas fa-eye-slash"></i> Hide Media`
        : `<i class="fas fa-eye"></i> Show Media`;
    };

    container.appendChild(toggleBtn);
  }

  if (downloads.length) {
  
  const downloadWrapper = document.createElement("div");
downloadWrapper.className = "download-wrapper";

const select = document.createElement("select");
select.className = "download-select";
downloads.forEach(dl => {
  const opt = document.createElement("option");
  opt.value = dl.url;
  opt.textContent = dl.label;
  select.appendChild(opt);
});

const downloadBtn = document.createElement("button");
downloadBtn.className = "download-btn";
downloadBtn.innerHTML = `<i class="fas fa-download"></i> Download`;
downloadBtn.onclick = () => {
  const selectedUrl = select.value;
  if (selectedUrl) window.open(selectedUrl, "_blank");
};

downloadWrapper.appendChild(select);
downloadWrapper.appendChild(downloadBtn);
container.appendChild(downloadWrapper);
  }

  return container;
}

loadApis();
