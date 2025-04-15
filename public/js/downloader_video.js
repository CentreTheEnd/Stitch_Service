function getPlatform(url) {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("facebook.com") || url.includes("fb.watch")) return "facebook";
  if (url.includes("instagram.com")) return "instagram";
  return null;
}

async function handleDownload() {
  const url = document.getElementById("videoUrl").value.trim();
  const platform = getPlatform(url);

  if (platform !== "youtube") {
    alert("Currently, only YouTube is supported in this example.");
    return;
  }

  const apiUrl = `https://stitch-api.vercel.app/api/v2/sections/Download/Youtube/ochinpo?q=${encodeURIComponent(url)}`;

  try {
    const res = await fetch(apiUrl);
    const result = await res.json();

    if (result.status && result.data) {
      const data = result.data;
      const resultDiv = document.getElementById("result");
      resultDiv.innerHTML = ""; // Clear previous content

      const title = document.createElement("h2");
      title.textContent = "Video Details:";
      resultDiv.appendChild(title);

      const thumbnail = document.createElement("img");
      thumbnail.src = data.thumbnail;
      thumbnail.alt = "Thumbnail";
      resultDiv.appendChild(thumbnail);

      const videoPlayer = document.createElement("video");
      videoPlayer.controls = true;
      videoPlayer.src = data.video;
      videoPlayer.width = 640; // Set player width
      resultDiv.appendChild(videoPlayer);

      const infoList = [
        ["Title", data.title],
        ["Description", data.description],
        ["Duration", data.time],
        ["Uploaded", data.ago],
        ["Views", data.views.toLocaleString()],
        ["Channel", `<a href="${data.channel}" target="_blank">${data.author}</a>`],
        ["Original Video Link", `<a href="${data.url}" target="_blank">Watch</a>`],
      ];

      for (const [label, value] of infoList) {
        const p = document.createElement("p");
        p.innerHTML = `<strong>${label}:</strong> ${value}`;
        resultDiv.appendChild(p);
      }

      // Show download options
      const downloadOptions = document.getElementById("downloadOptions");
      downloadOptions.classList.remove("hidden");

      // Add download button based on selection
      document.getElementById("downloadBtn").onclick = function () {
        const downloadType = document.getElementById("downloadType").value;
        let downloadUrl = "";

        switch (downloadType) {
          case "video":
            downloadUrl = data.video;
            break;
          case "audio":
            downloadUrl = data.audio;
            break;
          case "thumbnail":
            downloadUrl = data.thumbnail;
            break;
          default:
            alert("Download type not supported");
            return;
        }

        // Start downloading the file
        window.open(downloadUrl, "_blank");
      };

      resultDiv.classList.remove("hidden");
    } else {
      alert("Failed to fetch video data.");
    }
  } catch (err) {
    alert("An error occurred while connecting to the API.");
    console.error(err);
  }
}
