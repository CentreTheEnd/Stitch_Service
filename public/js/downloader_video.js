const typeSelect = document.getElementById("typeSelect");
    const modelSelect = document.getElementById("modelSelect");
    const queryInput = document.getElementById("queryInput");
    const resultDiv = document.getElementById("result");
    const loading = document.getElementById("loading");

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

      loading.style.display = "block"; // Show loading
      resultDiv.innerHTML = "";

      try {
        const res = await fetch(url);
        const json = await res.json();

        
        loading.style.display = "none"; // Hide loading

        if (!json.status || !json.data) {
          resultDiv.innerHTML = "<p>No valid data found.</p>";
          return;
        }

        const container = renderData(json.data);
        resultDiv.appendChild(container);

      } catch (err) {
        loading.style.display = "none"; // Hide loading
        resultDiv.innerHTML = `<p>Error: ${err.message}</p>`;
      }
    }

    function renderData(obj) {
      const container = document.createElement("div");
      container.className = "media-block";

      let info = "", media = { thumb: "", image: "", video: "", audio: "" }, downloads = [];

      const renderMedia = (type, val) => {
        (Array.isArray(val) ? val : [val]).forEach((v, i) => {
          if (!v) return;
          const element = {
            thumb: `<img src="${v}" alt="Thumbnail" />`,
            image: `<img src="${v}" alt="Image" />`,
            video: `<video src="${v}" controls></video>`,
            audio: `<audio src="${v}" controls></audio>`
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
              info += `<p><strong>${key}.${sub}</strong>: ${val[sub]}</p>`;
            }
          } else {
            info += `<p><strong>${key}</strong>: ${val}</p>`;
          }
        }
      }

      const mediaGroup = document.createElement("div");
      mediaGroup.className = "media-group";
      mediaGroup.innerHTML = media.thumb + media.image + media.video + media.audio;
      container.appendChild(mediaGroup);

      const infoBlock = document.createElement("div");
      infoBlock.className = "info";
      infoBlock.innerHTML = info;
      container.appendChild(infoBlock);

      if (downloads.length > 0) {
        const downloadDiv = document.createElement("div");
        downloadDiv.className = "download-select";
        downloads.forEach(({ label, url }) => {
          const btn = document.createElement("button");
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
