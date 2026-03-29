import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import cors from "cors";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfModule = require("pdf-parse");
console.log("pdf-parse module structure:", {
  type: typeof pdfModule,
  keys: Object.keys(pdfModule || {}),
  isFunction: typeof pdfModule === 'function'
});

// Try to find the actual parsing function
let pdf: any;
if (typeof pdfModule === 'function') {
  pdf = pdfModule;
} else if (pdfModule.default && typeof pdfModule.default === 'function') {
  pdf = pdfModule.default;
} else if (pdfModule.PDFParse && typeof pdfModule.PDFParse === 'function') {
  pdf = pdfModule.PDFParse;
} else {
  // Fallback to the module itself if it's an object that might have a callable property
  pdf = pdfModule;
}

console.log("Resolved pdf parser:", {
  type: typeof pdf,
  isConstructor: pdf && pdf.prototype && pdf.prototype.constructor === pdf
});
const mammothModule = require("mammoth");
const mammoth = mammothModule.default || mammothModule;
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import pdfjs-dist for fallback
let pdfjsLib: any;
try {
  pdfjsLib = require("pdfjs-dist/build/pdf.js");
} catch (e) {
  try {
    pdfjsLib = require("pdfjs-dist");
  } catch (e2) {
    console.error("Could not load pdfjs-dist:", e2);
  }
}

const upload = multer({ storage: multer.memoryStorage() });

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please ensure GEMINI_API_KEY is set in the environment.");
  }
  return new GoogleGenAI({ apiKey });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Backend File Parsing
  app.post("/api/parse", upload.single("resume"), async (req: any, res) => {
    console.log("--- POST /api/parse start ---");
    console.log("Request headers:", JSON.stringify(req.headers));
    console.log("Request details:", {
      url: req.url,
      method: req.method,
      hasFile: !!req.file,
      hasBody: !!req.body,
      bodyKeys: Object.keys(req.body || {})
    });

    try {
      let resumeText = req.body.resumeText || "";
      
      if (req.file) {
        const { buffer, mimetype, originalname, size } = req.file;
        console.log("File info:", { originalname, mimetype, size });

        try {
          if (mimetype === "application/pdf") {
            console.log("Attempting to parse PDF...");
            let data: any;
            
            try {
              // Try calling pdf-parse as a function
              if (typeof pdf === 'function' && !pdf.PDFParse) {
                try {
                  data = await pdf(buffer);
                } catch (err: any) {
                  if (err.message?.includes("Class constructor")) {
                    console.log("Retrying as class constructor...");
                    data = await new (pdf as any)(buffer);
                  } else {
                    throw err;
                  }
                }
              } else {
                throw new Error("pdf-parse not available as function");
              }
            } catch (err: any) {
              console.error("Primary PDF parsing failed, trying pdfjs-dist fallback...", err);
              // Fallback to pdfjs-dist
              if (pdfjsLib) {
                try {
                  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
                  const pdfDocument = await loadingTask.promise;
                  let fullText = "";
                  for (let i = 1; i <= pdfDocument.numPages; i++) {
                    const page = await pdfDocument.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items
                      .map((item: any) => item.str || "")
                      .join(' ');
                    fullText += pageText + "\n";
                  }
                  data = { text: fullText };
                  console.log("Fallback PDF parsing succeeded, text length:", fullText.length);
                } catch (fallbackError: any) {
                  console.error("Fallback PDF parsing failed:", fallbackError);
                  
                  // Handle specific pdfjs-dist exceptions
                  let errorMessage = "Failed to parse PDF file.";
                  if (fallbackError.name === 'PasswordException') {
                    errorMessage = "This PDF is password-protected and cannot be parsed.";
                  } else if (fallbackError.name === 'InvalidPDFException') {
                    errorMessage = "The file is not a valid PDF or is corrupted.";
                  } else if (fallbackError.name === 'FormatError') {
                    errorMessage = "The PDF format is invalid or unsupported.";
                  } else if (fallbackError.name === 'AbortException') {
                    errorMessage = "PDF parsing was aborted.";
                  } else if (fallbackError.message) {
                    errorMessage = `PDF parsing failed: ${fallbackError.message}`;
                  }
                  
                  throw new Error(errorMessage);
                }
              } else {
                throw err;
              }
            }
            
            console.log("PDF parse result keys:", Object.keys(data || {}));
            if (data && typeof data.text === 'string' && data.text.trim().length > 0) {
              resumeText = data.text;
              console.log("Extracted PDF text length:", resumeText.length);
            } else if (data && typeof data === 'string' && data.trim().length > 0) {
              resumeText = data;
              console.log("Extracted PDF text (direct string) length:", resumeText.length);
            } else {
              console.warn("PDF parsing returned no text field. Data:", JSON.stringify(data).substring(0, 200));
              // Try fallback if text is empty
              if (pdfjsLib) {
                try {
                  console.log("PDF text is empty, trying fallback...");
                  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
                  const pdfDocument = await loadingTask.promise;
                  let fullText = "";
                  for (let i = 1; i <= pdfDocument.numPages; i++) {
                    const page = await pdfDocument.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items
                      .map((item: any) => item.str || "")
                      .join(' ');
                    fullText += pageText + "\n";
                  }
                  if (fullText.trim().length > 0) {
                    resumeText = fullText;
                    console.log("Fallback PDF parsing succeeded after empty text, length:", fullText.length);
                  }
                } catch (fallbackError: any) {
                  console.error("Fallback PDF parsing failed after empty text:", fallbackError);
                }
              }
            }
          } else if (
            mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ) {
            console.log("Attempting to parse DOCX...");
            const result = await mammoth.extractRawText({ buffer });
            resumeText = result.value;
            console.log("Extracted DOCX text length:", resumeText.length);
          } else if (mimetype === "text/plain") {
            console.log("Attempting to parse TXT...");
            resumeText = buffer.toString("utf-8");
            console.log("Extracted TXT text length:", resumeText.length);
          } else {
            console.log("Unsupported file type:", mimetype);
            return res.status(400).json({ error: "Unsupported file type: " + mimetype });
          }
        } catch (parseError: any) {
          console.error("File parsing logic failed:", parseError);
          return res.status(400).json({
            error: `Failed to parse file: ${parseError.message || "Unknown error"}`,
            details: parseError.stack
          });
        }
      }

      if (!resumeText || resumeText.trim().length === 0) {
        console.log("Validation failed: No resume text extracted or provided");
        return res.status(400).json({ 
          error: "No resume text could be extracted from the file or provided manually. Please ensure the file is not empty or password-protected." 
        });
      }

      console.log("Successfully prepared resume text, length:", resumeText.length);
      res.json({ resumeText });
    } catch (error: any) {
      console.error("Critical error in /api/parse:", error);
      res.status(500).json({ error: "Internal server error during file parsing" });
    }
    console.log("--- POST /api/parse end ---");
  });

  // GET handler for testing
  app.get("/api/parse", (req, res) => {
    res.json({ message: "API parse endpoint is alive. Use POST to upload files." });
  });

  // 404 handler for API routes
  app.all("/api/*", (req, res) => {
    console.log(`404 API route not found: ${req.method} ${req.url}`);
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global error handler:", err);
    res.status(err.status || 500).json({
      error: err.message || "Internal server error",
      details: err.stack
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
