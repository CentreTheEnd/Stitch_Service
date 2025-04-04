import path from "path";
import axios from 'axios';
import { fileURLToPath } from 'url';
import fs from "fs/promises";

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

async function loadRouters(directoryPath, version, app) {
    try {
        const filesAndDirs = await fs.readdir(directoryPath);

        const folders = [];
        for (const item of filesAndDirs) {
            const itemPath = path.join(directoryPath, item);
            const stats = await fs.stat(itemPath);

            if (stats.isDirectory()) {
                folders.push(item);
            }
        }

        const paths = folders.reduce((obj, folder) => {
            obj[folder] = path.join(directoryPath, folder);
            return obj;
        }, {});

        for (const [key, dirPath] of Object.entries(paths)) {
            const files = await fs.readdir(dirPath);

            for (const file of files) {
                if (file.endsWith('.js')) {
                    try {
                        const fileName = file.replace('.js', '');
                        const filePath = path.join(dirPath, file);
                        const routerModule = await import(filePath);
                        const router = routerModule.default;
                        const metadata = routerModule.usedRouterKeys;

                        if (typeof router === 'function') {
                            const baseRoute = `/api/${version}/sections/${key}`;
                            app.use(baseRoute, router);

                            if (router.stack) {
                                router.stack.forEach(layer => {
                                    if (layer.route && layer.route.path) {
                                        let fullUrl = `${baseRoute}${layer.route.path}`;
                                        const method = Object.keys(layer.route.methods)[0]?.toUpperCase() || "UNKNOWN";

                                        const routeData = {
                                            title: fileName,
                                            type: key,
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

                                        categorizedApis.data[key] = categorizedApis.data[key] || { data: [] };
                                        categorizedApis.data[key].data.push(routeData);

                                        if (!apiRoutes[0].data.some(route => route.url === fullUrl)) {
                                            apiRoutes[0].data.push(routeData);
                                        }
                                    }
                                });
                            }
                        }
                    } catch (error) {
                        errorLogs.push({ file: path.join(dirPath, file), error: error.message });
                        console.error(`Error loading ${file}:`, error.message);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error loading routers:', error.message);
    }
}

export async function setupRoutes(app) {
    const directoryPath = path.join(__dirname, '../../Routes');
    await loadRouters(directoryPath, "v2", app);

    Object.keys(categorizedApis.data).forEach((key) => {
        app.get(`/api/v3/apis/sections/${key}/api`, (req, res) => {
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

    app.get('/api/v3/apis', (req, res) => {
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

    app.get('/api/v3/apis/sections', (req, res) => {
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

    app.get('/api/v3/apis/errorlog', (req, res) => {
        res.status(200).json(errorLogs);
    });
}
