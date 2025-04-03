import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiRoutes = [
    {
        status: true,
        author: global.author,
        data: [],
    }
];

const categorizedApis = {
    status: true,
    author: global.author,
    data: {},
};

const errorLogs = [];

//const directoryPath = path.join(__dirname, '../../Routers');
const directoryPath =  '../../Routes';
console.log("directoryPatho:", directoryPath);

async function loadRouters(directoryPath, app) {
    try {
 const loadFromDirectory = async (directory, version, app) => {

 const basePath = path.resolve(directory);
 const folders = (await fs.readdir(basePath)).filter(async (item) => {
  return (await fs.stat(path.join(basePath, item))).isDirectory();
  });

 for (const folder of folders) {
 const folderPath = path.join(basePath, folder);
 const files = await fs.readdir(folderPath);

 for (const file of files) {
 if (file.endsWith(".js")) {
 
 try {
 
 const fileName = file.replace(".js", "");
 const filePath = path.join(folderPath, file);
 const routerModule = await import(filePath);
 const router = routerModule.default;
 const metadata = routerModule;

 if (typeof router === "function") {
 const baseRoute = `/api/${version}/${folder}`;
 app.use(baseRoute, router);

 if (router.stack) {
 router.stack.forEach((layer) => {
 if (layer.route && layer.route.path) {
 let fullUrl = `${baseRoute}${layer.route.path}`;
 const method = Object.keys(layer.route.methods)[0]?.toUpperCase() || "UNKNOWN";

 const routeData = {
 title: fileName,
 type: folder,
 method: method,
 tag: metadata.tag || "unknown",
 description: metadata.description || "No description",
 query: metadata.query || {},
 limited: metadata.limited || 0,
 status: metadata.status ?? true,
 price: metadata.price || "free",
 url: fullUrl,
 path: layer.route.path,
 };

                                        categorizedApis.data[folder] = categorizedApis.data[folder] || { data: [] };
                                        categorizedApis.data[folder].data.push(routeData);

 if (!apiRoutes[0].data.some((route) => route.url === fullUrl)) {
 apiRoutes[0].data.push(routeData);

 } } });
 } } 

 } catch (error) {
 errorLogs.push({ file: path.join(folderPath, file), error: error.message });
 console.error(`Error loading ${file}:`, error.message);
 }

 } } }
 };

        await loadFromDirectory(directoryPath, "v2", app);

    } catch (error) {
        console.error("Error loading tracks:", error.message);
    }
}


export async function setupRoutes(app) {

await loadRouters(directoryPath, app);

Object.keys(categorizedApis.data).forEach((key) => {
    app.get(`api/v3/apis/sections/${key}/api`, (req, res) => {
        const apisForCategory = categorizedApis.data[key].data.map(api => ({
            ...api,
            url: `${req.protocol}://${req.get('host')}${api.url}`,
        }));
        res.status(200).json({
            status: true,
            author: global.author,
            data: apisForCategory
        });
    });
});


app.get('api/v3/apis/sections', (req, res) => {
    const fullApiRoutes = apiRoutes.map(route => ({
        status: route.status,
        author: route.author,
        data: route.data.map(api => ({
            ...api,
            url: `${req.protocol}://${req.get('host')}${api.url}`,
        })),
    }));
    res.status(200).json(fullApiRoutes);
});

app.get('api/v3/apis', (req, res) => {
    const categorizedWithHost = Object.entries(categorizedApis.data).reduce(
        (result, [key, apis]) => {
            result[key] = apis.data.map(api => ({
                ...api,
                url: `${req.protocol}://${req.get('host')}${api.url}`,
            }));
            return result;
        },
        {}
    );
    res.status(200).json(categorizedWithHost);
});

app.get('api/v3/apis/errorlog', (req, res) => {
    res.status(200).json(errorLogs);
});

}

//______________________________________________
