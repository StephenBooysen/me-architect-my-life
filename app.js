// Base requires
const express = require("express");
const cors = require("cors");
const path = require("path");
const EventEmitter = require('events');
const expressLayouts = require("express-ejs-layouts");

const WebDatabase = require("./src/components/webdatabase.js");

const app = express();
const port = process.env.PORT || 3100;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up EJS templating
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set up express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// PWA headers middleware
app.use((req, res, next) => {
  // Add PWA-friendly headers
  if (req.path === '/site.webmanifest') {
    res.setHeader('Content-Type', 'application/manifest+json');
  }
  
  // Service worker should not be cached
  if (req.path === '/sw.js') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  // Add security headers for PWA
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});

// launch our event emitter
const eventEmitter = new EventEmitter()

// Initiate the service Registry
const serviceRegistry = require('noobly-core');
serviceRegistry.initialize(app,eventEmitter);

const log = serviceRegistry.logger('console');
const cache = serviceRegistry.cache('memory');
const dataserve = serviceRegistry.dataServe('memory');
const filing = serviceRegistry.filing('local');
const queue = serviceRegistry.queue('memory');
const scheduling = serviceRegistry.scheduling('memory');
const searching = serviceRegistry.searching('memory');
const measuring = serviceRegistry.measuring('memory');
const notifying = serviceRegistry.notifying('memory');
const worker = serviceRegistry.working('memory');
const workflow = serviceRegistry.workflow('memory');

// Initiate the Application Registry
const applicationRegistry = require('noobly-applications');
applicationRegistry.initialize(app,eventEmitter,serviceRegistry);

const customerservice = applicationRegistry.getApplication("customerservice");
const delivery = applicationRegistry.getApplication("delivery");
const infrastructure = applicationRegistry.getApplication("infrastructure");
const marketing = applicationRegistry.getApplication("marketing");
const warehouse = applicationRegistry.getApplication("warehouse");
const wiki = applicationRegistry.getApplication("wiki");


// Database instance
const database = new WebDatabase();

// Initialize database and start server
async function startServer() {
  try {
    await database.init();
    
    // Initialize routes and pages after database is ready
    const routes = require("./src/routes")(app, database);
    const pages = require("./src/pages")(app);
    
    const server = app.listen(port, () => {
      console.log(`Web server running at http://localhost:${port}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          console.error(`Port ${port} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`Port ${port} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        if (database && database.db) {
          database.db.close();
        }
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        if (database && database.db) {
          database.db.close();
        }
        process.exit(0);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
