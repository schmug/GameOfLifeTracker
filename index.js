// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  highScores;
  userCurrentId;
  highScoreCurrentId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.highScores = /* @__PURE__ */ new Map();
    this.userCurrentId = 1;
    this.highScoreCurrentId = 1;
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.userCurrentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  // High Score methods implementation
  async getAllHighScores() {
    return Array.from(this.highScores.values());
  }
  async getHighScoreBySessionId(sessionId) {
    return Array.from(this.highScores.values()).find(
      (score) => score.sessionId === sessionId
    );
  }
  async createHighScore(highScore) {
    const id = this.highScoreCurrentId++;
    const { date, ...restHighScore } = highScore;
    const dateISOString = date instanceof Date ? date.toISOString() : (/* @__PURE__ */ new Date()).toISOString();
    const newHighScore = {
      ...restHighScore,
      id,
      date: dateISOString
      // Store as ISO string
    };
    this.highScores.set(id, newHighScore);
    return newHighScore;
  }
  async updateHighScoreBySessionId(sessionId, data) {
    const existingHighScore = await this.getHighScoreBySessionId(sessionId);
    if (!existingHighScore) {
      return void 0;
    }
    const updatedHighScore = { ...existingHighScore, ...data };
    this.highScores.set(existingHighScore.id, updatedHighScore);
    return updatedHighScore;
  }
  async getAllTimeBestScores() {
    const scores = Array.from(this.highScores.values());
    if (scores.length === 0) {
      return {
        maxGenerations: null,
        maxPopulation: null,
        longestPattern: null
      };
    }
    const nonZeroGenScores = scores.filter((score) => score.maxGenerations > 0);
    const nonZeroPopScores = scores.filter((score) => score.maxPopulation > 0);
    const nonZeroPatternScores = scores.filter((score) => score.longestPattern > 0);
    const maxGenScore = nonZeroGenScores.length > 0 ? nonZeroGenScores.reduce((prev, current) => prev.maxGenerations > current.maxGenerations ? prev : current) : null;
    const maxPopScore = nonZeroPopScores.length > 0 ? nonZeroPopScores.reduce((prev, current) => prev.maxPopulation > current.maxPopulation ? prev : current) : null;
    const longestPatternScore = nonZeroPatternScores.length > 0 ? nonZeroPatternScores.reduce((prev, current) => prev.longestPattern > current.longestPattern ? prev : current) : null;
    return {
      maxGenerations: maxGenScore,
      maxPopulation: maxPopScore,
      longestPattern: longestPatternScore
    };
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var highScores = pgTable("high_scores", {
  id: serial("id").primaryKey(),
  maxGenerations: integer("max_generations").notNull(),
  maxPopulation: integer("max_population").notNull(),
  longestPattern: integer("longest_pattern").notNull(),
  gridSize: integer("grid_size").notNull(),
  date: timestamp("date").notNull(),
  sessionId: text("session_id").notNull()
});
var insertHighScoreSchema = createInsertSchema(highScores).pick({
  maxGenerations: true,
  maxPopulation: true,
  longestPattern: true,
  gridSize: true,
  sessionId: true,
  date: true
});
var updateHighScoreSchema = insertHighScoreSchema.partial();

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/high-scores", async (_req, res) => {
    try {
      const highScores2 = await storage.getAllHighScores();
      res.json(highScores2);
    } catch (error) {
      console.error("Error fetching high scores:", error);
      res.status(500).json({ message: "Failed to fetch high scores" });
    }
  });
  app2.post("/api/high-scores", async (req, res) => {
    try {
      let dateStr = req.body.date || (/* @__PURE__ */ new Date()).toISOString();
      let date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        date = /* @__PURE__ */ new Date();
      }
      const highScoreData = {
        sessionId: req.body.sessionId,
        maxGenerations: req.body.maxGenerations || 0,
        maxPopulation: req.body.maxPopulation || 0,
        longestPattern: req.body.longestPattern || 0,
        gridSize: req.body.gridSize || 25,
        date
      };
      const validatedData = insertHighScoreSchema.parse(highScoreData);
      const newHighScore = await storage.createHighScore(validatedData);
      res.status(201).json(newHighScore);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid high score data", errors: error.errors });
      } else {
        console.error("Error creating high score:", error);
        res.status(500).json({ message: "Failed to create high score" });
      }
    }
  });
  app2.patch("/api/high-scores/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const updateData = req.body;
      if (!updateData.date) {
        updateData.date = /* @__PURE__ */ new Date();
      }
      const validatedData = updateHighScoreSchema.parse(updateData);
      const updatedHighScore = await storage.updateHighScoreBySessionId(sessionId, validatedData);
      if (!updatedHighScore) {
        return res.status(404).json({ message: "High score not found" });
      }
      res.json(updatedHighScore);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid high score data", errors: error.errors });
      } else {
        console.error("Error updating high score:", error);
        res.status(500).json({ message: "Failed to update high score" });
      }
    }
  });
  app2.get("/api/high-scores/best/all-time", async (_req, res) => {
    try {
      const bestScores = await storage.getAllTimeBestScores();
      res.json(bestScores);
    } catch (error) {
      console.error("Error fetching best scores:", error);
      res.status(500).json({ message: "Failed to fetch best scores" });
    }
  });
  app2.get("/api/high-scores/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const highScore = await storage.getHighScoreBySessionId(sessionId);
      if (!highScore) {
        return res.status(404).json({ message: "High score not found" });
      }
      res.json(highScore);
    } catch (error) {
      console.error("Error fetching high score:", error);
      res.status(500).json({ message: "Failed to fetch high score" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  base: "/conways-game-of-life/",
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
