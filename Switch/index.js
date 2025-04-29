import path from "path";
import axios from 'axios';
import { fileURLToPath } from 'url';
import fs from "fs/promises";
import syntaxError from 'syntax-error';
import { format } from 'util';
import { createRequire } from 'module';
import { User } from '../Database/Mongo/models.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(__dirname);

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

const errorLogsApi = [];

const accountRoutes = [
    {
        status: true,
        author: global.author,
        data: [],
    }
];

const categorizedAccount = {
    status: true,
    author: global.author,
    data: {},
};

const errorLogsAccount = [];

const errorLogs= [];


async function loadRouters(directoryPath, version, app, methodRouter) {
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
                        //const metadata = routerModule.usedRouterKeys;

                        const metadata = Object.keys(routerModule).reduce((acc, key) => {
              if (key !== 'default') {
              Object.assign(acc, routerModule[key]);
               }
               return acc;
               }, {});

                        if (typeof router === 'function') {

                            let baseRoute = null;
                            
                            if ( methodRouter === 'api' ) {
                             baseRoute = `/api/${version}/sections/${key}`;
                            } else {
                             baseRoute = `/api/${version}/${key}`;
                            }
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
                                           url: fullUrl,
                                           path: layer.route.path,
                                           file: path.join(dirPath, file),
                                           ...metadata,
                                           };

                                        if ( methodRouter === 'api' ) {
                                        categorizedApis.data[key] = categorizedApis.data[key] || { data: [] };
                                        categorizedApis.data[key].data.push(routeData);

                                        if (!apiRoutes[0].data.some(route => route.url === fullUrl)) {
                                            apiRoutes[0].data.push(routeData);
                                        }
                                        } else {
                                        categorizedAccount.data[key] = categorizedAccount.data[key] || { data: [] };
                                        categorizedAccount.data[key].data.push(routeData);

                                        if (!accountRoutes[0].data.some(route => route.url === fullUrl)) {
                                            accountRoutes[0].data.push(routeData);
                                        }
                                        }
                                    }
                                });
                            }
                        }
                    } catch (error) {
                        if ( methodRouter === 'api' ) {
                        errorLogsApi.push({ file: path.join(dirPath, file), error: error.message });
                        } else {
                        errorLogsAccount.push({ file: path.join(dirPath, file), error: error.message });
                        }
                        console.error(`Error loading ${file}:`, error.message);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error loading routers:', error.message);
        errorLogs.push({ message: 'Error loading routers', error: error.message });
    }
}

export async function setupRoutes(app) {
    
    const directoryPathAccounts = path.join(__dirname, '../Accounts');
    await loadRouters(directoryPathAccounts, "v1", app, 'account');
    
    // ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⌲
    
    const directoryPathApi = path.join(__dirname, '../Api');
   // ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⌲

    
    app.use(async (req, res, next) => {
    
    //if (req.originalUrl.toLowerCase().includes('/api/v1/User/CreateApikey')) return next();    
    //if (!req.originalUrl.toLowerCase().includes('/api/v1') && !req.originalUrl.toLowerCase().includes('/api/v2')) return next();
    //if (req.originalUrl.toLowerCase().includes('/api/v1/Auth')) return next();

    if (!req.originalUrl.toLowerCase().includes('/api/v2') || !req.originalUrl.toLowerCase().startsWith('/api/v2')) return next();
        
    const apiKeyHeader = req.headers['api-key'];
    const verKey req.headers['x-vercel-dev'];
         
    const verCo req.headers['dev-co'];
        
    if (!verCo || !verKey || !apiKeyHeader || apiKeyHeader !== global.isApiKey) { // || apiKeyHeader !== global.isApiKey
        return res.status(400).json({ status: false, message: 'Missing API Key' });
    } 

        /*

    let matchedApi = null;
    let section = null;

    for (const [sec, secData] of Object.entries(categorizedApis.data)) {
        const foundApi = secData.data.find(api => req.originalUrl.startsWith(api.url));
        if (foundApi) {
            matchedApi = foundApi;
            section = sec;
            break;
        }
    }

    if (!matchedApi) {
        return res.status(404).json({ status: false, message: 'API not found in catalog' });
    }

    const limitedUsage = parseInt(matchedApi.limited || 1); 
    const apiType = matchedApi.title;

    try {
        const user = await User.findOne({ 'apiKey.value': apiKeyHeader });
        if (!user) return res.status(401).json({ status: false, message: 'Invalid API Key' });

        if (user.limited < limitedUsage) {
            return res.status(403).json({ status: false, message: 'Usage limit exceeded' });
        }

        user.limited -= limitedUsage;
        user.usage.total += 1;
        user.usage.lastUse = new Date();

        const sectionUsage = user.usage.sections.get(section) || {
            usage: 0,
            lastUse: new Date(),
            api: new Map()
        };

        sectionUsage.usage += 1;
        sectionUsage.lastUse = new Date();

        const apiData = sectionUsage.api.get(apiType) || {
            type: apiType,
            usage: 0,
            lastUse: new Date(),
            lastRequest: req.originalUrl
        };

        apiData.usage += 1;
        apiData.lastUse = new Date();
        apiData.lastRequest = req.originalUrl;

        sectionUsage.api.set(apiType, apiData);
        user.usage.sections.set(section, sectionUsage);

        await user.save();
        req.user = user;
        next();
    } catch (err) {
        console.error('Middleware error:', err);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
    */
        next();
});



    
    
    await loadRouters(directoryPathApi, "v2", app, 'api');
    
    // ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⌲
    
    Object.keys(categorizedAccount.data).forEach((key) => {
        app.get(`/api/v3/accounts/sections/${key}/api`, (req, res) => {
            const apisForCategory = categorizedAccount.data[key].data.map(api => ({
                ...api,
                url: `${req.protocol === 'http' ? 'https' : req.protocol}://${req.get('host')}${api.url}`,
            }));
            res.status(200).json({
                status: true,
                author: global.author,
                data: apisForCategory
            });
        });
    });

    app.get('/api/v3/accounts', (req, res) => {
        const fullApiRoutes = accountRoutes.map(route => ({
            status: route.status,
            author: route.author,
            data: route.data.map(api => ({
                ...api,
                url: `${req.protocol === 'http' ? 'https' : req.protocol}://${req.get('host')}${api.url}`,
            })),
        }));
        res.status(200).json(fullApiRoutes);
    });

    app.get('/api/v3/accounts/sections', (req, res) => {
        const categorizedWithHost = Object.entries(categorizedAccount.data).reduce(
            (result, [key, apis]) => {
                result[key] = apis.data.map(api => ({
                    ...api,
                    url: `${req.protocol === 'http' ? 'https' : req.protocol}://${req.get('host')}${api.url}`,
                }));
                return result;
            },
            {}
        );
        res.status(200).json(categorizedWithHost);
    });

    app.get('/api/v3/accounts/errorlog', (req, res) => {
        res.status(200).json(errorLogsAccount);
    });

    // ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⌲

    Object.keys(categorizedApis.data).forEach((key) => {
        app.get(`/api/v3/apis/sections/${key}/api`, (req, res) => {
            const apisForCategory = categorizedApis.data[key].data.map(api => ({
                ...api,
                url: `${req.protocol === 'http' ? 'https' : req.protocol}://${req.get('host')}${api.url}`,
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
                url: `${req.protocol === 'http' ? 'https' : req.protocol}://${req.get('host')}${api.url}`,
            })),
        }));
        res.status(200).json(fullApiRoutes);
    });

    app.get('/api/v3/apis/sections', (req, res) => {
        const categorizedWithHost = Object.entries(categorizedApis.data).reduce(
            (result, [key, apis]) => {
                result[key] = apis.data.map(api => ({
                    ...api,
                    url: `${req.protocol === 'http' ? 'https' : req.protocol}://${req.get('host')}${api.url}`,
                }));
                return result;
            },
            {}
        );
        res.status(200).json(categorizedWithHost);
    });

    app.get('/api/v3/apis/errorlog', (req, res) => {
        res.status(200).json(errorLogsApi);
    });

    app.get('/api/v3/errorlog', (req, res) => {
        res.status(200).json(errorLogs);
    });

  /*
 app.post('/api/v3/eval', (req, res) => {
  const { code } = req.body;

  let result = '';
  let error = '';

  const wrappedCode = `return (async () => {\n${code}\n})()`;

  const err = syntaxError(wrappedCode, 'exec.js', {
    allowReturnOutsideFunction: true,
    allowAwaitOutsideFunction: true,
    sourceType: 'module'
  });

  if (err) {
    return res.json({ result: '', error: err.toString() });
  }

  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const func = new AsyncFunction(wrappedCode);
    const execResult = await func();
    result = format(execResult);
  } catch (e) {
    error = e.toString();
  }

  res.json({ result, error });
});
    */
    
   app.get('/api/v3/data', (req, res) => {

  const reqData = {
    host: req.get('host'),
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    query: req.query,
    params: req.params,
    body: req.body,
    ip: req.ip,
    ips: req.ips,
    protocol: req.protocol,
    hostname: req.hostname,
    path: req.path,
    secure: req.secure,
    xhr: req.xhr,
    cookies: req.cookies || {},
    signedCookies: req.signedCookies || {},
    user: req.user || null
    
  };

  res.status(200).json(reqData);
});


app.get('/api/v3/check', (req, res) => {
    if (global.isBot(req)) {
        return res.json({ isBot: true, message: `Don't try scrape me , to learn first.` });
    } else {
        return res.json({ isBot: false, message: 'Welcome pro.' });
    }
});
    
    
}





