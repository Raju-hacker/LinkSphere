import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Helper to fetch title directly from URL
async function fetchPageTitle(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const text = await res.text();
    // Match <title> tag with regex
    const titleMatch = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      let title = titleMatch[1].replace(/\s+/g, ' ').trim();
      // Simple HTML entity decoding
      title = title
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&ndash;/g, '–')
        .replace(/&mdash;/g, '—');
      return title || null;
    }
  } catch (error) {
    // Suppress warning log for fetch failures (e.g. redirect count exceeded, certificate issues).
    // This is an expected and handled case; the app will successfully fall back to Gemini or domain parsing.
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json());

  // API router / endpoints
  app.post("/api/auto-title", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "URL is required" });
      }

      // Normalize URL
      let cleanedUrl = url.trim();
      if (!/^https?:\/\//i.test(cleanedUrl)) {
        cleanedUrl = `https://${cleanedUrl}`;
      }

      // Parse host and basic path
      let hostname = "Website";
      try {
        const urlObj = new URL(cleanedUrl);
        hostname = urlObj.hostname.replace("www.", "");
      } catch {
        return res.status(400).json({ error: "Invalid URL format" });
      }

      // Try directly fetching first
      const rawTitle = await fetchPageTitle(cleanedUrl);

      let finalTitle = "";

      // Initialize Gemini only when first needed
      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              }
            }
          });

          const prompt = `You are an expert helper that extracts, cleans, and translates URL web addresses into beautiful, clean, concise website titles for a professional web-link bookmark manager.

We are resolving details for the following URL: "${cleanedUrl}"
We attempted to fetch the target URL's page HTML. ${rawTitle ? `Directly fetched <title> tag value: "${rawTitle}"` : `Direct page fetch failed to inspect page HTML.`}

Your objective:
- Detect the name of the link, page, service, brand, or repository.
- Avoid trailing marketing tags or generic page types like "Log in", "Sign up", "Privacy Policy", "Welcome", "Homepage", "- Home" unless they are the actual core identity.
- Transform verbose titles like "React - A JavaScript library for building user interfaces" into nice brief name like "React".
- Strictly keep your final description between 2 to 6 words (maximum 50 characters).
- Respond ONLY with the single clean title string. Do not wrap it in quotes, markdown, brackets, or include any surrounding explanatory content.`;

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              temperature: 0.2, // Low temperature for deterministic behavior
            }
          });

          finalTitle = response.text?.trim() || "";
        } catch (geminiError) {
          console.error("Gemini Title auto generation failed:", geminiError);
        }
      }

      // Fallback Strategy
      if (!finalTitle) {
        if (rawTitle) {
          finalTitle = rawTitle;
        } else {
          // Generate an elegant name from domain/path
          try {
            const urlObj = new URL(cleanedUrl);
            const domainParts = hostname.split('.');
            const siteName = domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);
            
            const pathname = urlObj.pathname;
            if (pathname && pathname !== '/') {
              const cleanPath = pathname
                .split('/')
                .filter(p => p)
                .pop() || '';
              const pageName = cleanPath
                .replace(/[-_]/g, ' ')
                .replace(/\.[a-zA-Z0-9]+$/, ''); // slice extension
              if (pageName) {
                const formattedPage = pageName
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
                finalTitle = `${formattedPage} - ${siteName}`;
              } else {
                finalTitle = siteName;
              }
            } else {
              finalTitle = siteName;
            }
          } catch {
            finalTitle = hostname;
          }
        }
      }

      // Max length limit protection
      if (finalTitle.length > 100) {
        finalTitle = finalTitle.slice(0, 97) + "...";
      }

      return res.json({ success: true, title: finalTitle });
    } catch (err) {
      console.error("Error in /api/auto-title:", err);
      return res.status(500).json({ error: "Internal server error during auto title generation" });
    }
  });

  // Serve static assets or use Vite in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched and active on port ${PORT}`);
  });
}

startServer();
