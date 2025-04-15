import { setupApp } from './main.js';

console.log(`Loading Start Project...`);

try {
    const PORT = process.env.PORT || 3000;
    const app = await setupApp();
    console.log(`Loading Start in port:`, PORT);
    
    const redirectToError = (res, code) => {
  if (!res.headersSent) {
    res.status(code).redirect(`/html/error.html?code=${code}`);
  }
};

  app.use((err, req, res) => {
  console.error('خطأ في الخادم:', err.stack);

  let errorCode = 500;

  if (err.name === 'MongoError') {
    errorCode = 500;
  }

  else if (err.status === 404) {
    errorCode = 404; // Not Found
  }

  else if (err.status === 401) {
    errorCode = 401; // Unauthorized
  }

  else if (err.status === 403) {
    errorCode = 403; 
  }

  else if (err.code === 'ETIMEOUT') {
    errorCode = 504; 
  }

  else if (err.name === 'Error') {
    errorCode = 500; 
  }

  else if (err.status === 400) {
    errorCode = 400; 
  }

 
  redirectToError(res, errorCode);
});
    
    
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

} catch (error) {
    console.error("Error while starting the server:", error);
    process.exit(1);
}

/*
setupApp()
.then(app => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(error => {
    console.error("Error while starting the server:", error);
        process.exit(1);
    });
*/
