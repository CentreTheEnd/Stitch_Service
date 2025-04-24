import { setupApp } from './main.js';

console.log(`Loading Start Project...`);

try {
    const PORT = process.env.PORT || 3000;
    const app = await setupApp();
    console.log(`Loading Start in port:`, PORT);
    
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
