import express from 'express';
import axios from 'axios';
import fetch from 'node-fetch';

const router = express.Router();
const usedRouterKeys = {
  tag: "Genreat image",
  model: "pollinations",
  description: "ai convert text to image",
  query: { 
    q: "text prompt",
    model: "number model selector",
    width: "number width image",
    height: "number height image",
  },
  limited: 5,
  status: true,
  price: "free"
};

const pollinations = {
url: "https://image.pollinations.ai/prompt",
models: [
            {
                name: "flux",
                type: "image",
                censored: true,
                description: "Universal model, suitable for most scenarios",
                baseModel: true,
                vision: true,
                group: "Flux"
            },
            {
                name: "FLUX-3D",
                type: "image",
                censored: true,
                description: "Model optimized for 3D rendering style",
                baseModel: true,
                vision: true,
                group: "Flux"
            },
            {
                name: "FLUX-PRO",
                type: "image",
                censored: true,
                description: "Provides professional quality advanced models",
                baseModel: true,
                vision: true,
                group: "Flux"
            },
            {
                name: "Flux-realism",
                type: "image",
                censored: true,
                description: "Focus on realistic image generation",
                baseModel: true,
                vision: true,
                group: "Flux"
            },
            {
                name: "Flux-anime",
                type: "image",
                censored: true,
                description: "Optimized for generating anime-style images",
                baseModel: true,
                vision: true,
                group: "Flux"
            },
            {
                name: "Flux-cablyai",
                type: "image",
                censored: true,
                description: "Models with special artistic style",
                baseModel: true,
                vision: true,
                group: "Flux"
            },
            {
                name: "turbo",
                type: "image",
                censored: true,
                description: "Generate models quickly, speed first",
                baseModel: true,
                vision: true,
                group: "Turbo"
            }
],
image: async (prompt, modelIndex = 0, option = {}) => {
    const model = pollinations.models[modelIndex]?.name || "flux";
    const params = {
      prompt,
      model,
      width: option.width || "720",
      height: option.height || "1280",
      seed: option.seed ?? Math.floor(Math.random() * 2147483647),
      nologo: option.nologo ?? true,
      safe: option.safe ?? false,
      negative_prompt: option.negative_prompt || "worst quality, blurry"
    };

    let imageUrl = `${pollinations.url}/${encodeURIComponent(params.prompt)}`;
    imageUrl += `?width=${params.width}&height=${params.height}&seed=${params.seed}&model=${params.model}`;
    imageUrl += `&negative_prompt=${encodeURIComponent(params.negative_prompt)}`;
    imageUrl += `&nologo=${params.nologo}`;
    imageUrl += `&safe=${params.safe}`;

    return imageUrl;
  }
};

router.get('/text2image/pollinations', async (req, res) => {
  try {
    const { q, model, width, height, prompt } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Missing required parameter: ?q=(prompt)' });
    }

    if (!model) {
      const modelsList = pollinations.models.map((m, index) => ({
        index,
        name: m.name,
        description: m.description,
        group: m.group
      }));
      return res.json({
        status: true,
        message: "Please provide a model index using &model=number",
        models: modelsList
      });
    }


    const modelIndex = parseInt(model);
    if (isNaN(modelIndex) || modelIndex < 0 || modelIndex >= pollinations.models.length) {
      return res.status(400).json({ error: 'Invalid model index.' });
    }


    const imageUrl = await pollinations.image(q, modelIndex, { width, height, negative_prompt: prompt });

    res.json({
      status: true,
      creator: "pollinations",
      url: imageUrl,
      prompt: q,
      model: pollinations.models[modelIndex].name
    });

  } catch (error) {
    console.error("Error generating image:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


export { usedRouterKeys };
export default router;
