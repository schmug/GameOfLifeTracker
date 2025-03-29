import { registerRoutes } from "./routes";
import { serveStatic } from "./vite";

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    const url = new URL(request.url);

    // Handle static files
    if (url.pathname.startsWith("/assets/") || url.pathname === "/index.html") {
      return serveStatic(request);
    }

    // Handle API routes
    if (url.pathname.startsWith("/api/")) {
      return handleApiRequest(request);
    }

    // Serve index.html for all other routes (SPA support)
    return serveStatic(new Request(new URL("/index.html", request.url)));
  },
};

async function handleApiRequest(request: Request) {
  try {
    // Add your API route handling logic here
    // This is where you'll implement your API endpoints
    return new Response(JSON.stringify({ message: "API endpoint" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
