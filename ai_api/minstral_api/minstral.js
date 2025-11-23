const express = require("express");
const http = require("http");
const https = require("https");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const LLM_HOST = "localhost";
const LLM_PORT = 11434;
const ANALYZE_HOST = "127.0.0.1";
const ANALYZE_PORT = 5000;
const EXTERNAL_CAPTION_URL = "http://localhost:11434/completion";

app.post("/v1/chat/completions", (req, res) => {
  const data = JSON.stringify({
    prompt:
      req.body.messages.map((m) => `${m.role}: ${m.content}`).join("\n") +
      "\nassistant:",
    n_predict: 100,
  });

  const options = {
    hostname: LLM_HOST,
    port: LLM_PORT,
    path: "/completion",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  const request = http.request(options, (response) => {
    let body = "";
    response.on("data", (chunk) => (body += chunk));
    response.on("end", () => {
      try {
        const json = JSON.parse(body);
        res.json({ content: json.content });
        console.log("Response from LLM:", json.content);
      } catch (e) {
        res.status(500).json({ error: e.message, body });
      }
    });
  });
  request.on("error", (err) => res.status(500).json({ error: err.message }));
  request.write(data);
  request.end();
});

// Accept image analysis requests from the web client and forward to local analyze service
app.post("/analyze", (req, res) => {
  console.log("Received /analyze request");
  const payload = JSON.stringify(req.body || {});

  const options = {
    hostname: ANALYZE_HOST,
    port: ANALYZE_PORT,
    path: "/api/blip/analyze",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
      ...(req.headers.authorization
        ? { Authorization: req.headers.authorization }
        : {}),
    },
  };

  const request = http.request(options, (response) => {
    console.log("Received response from BLIP service");
    let body = "";
    response.on("data", (chunk) => (body += chunk));
    response.on("end", () => {
      console.log("BLIP response body:", body);
      try {
        const json = JSON.parse(body);

        // Optionally forward caption to external endpoint if configured
        if (EXTERNAL_CAPTION_URL && json && json.caption) {
          try {
            console.log("Forwarding caption to:", EXTERNAL_CAPTION_URL);
            const { URL } = require("url");
            const target = new URL(EXTERNAL_CAPTION_URL);
            const proto =
              target.protocol === "https:" ? https : http;
            console.log("Using protocol:", target.protocol);
            const fOptions = {
              hostname: target.hostname,
              port: target.port || (target.protocol === "https:" ? 443 : 80),
              path: target.pathname + (target.search || ""),
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true"
              },
            };
            console.log("Request options:", fOptions);
            const fReq = proto.request(fOptions, (fRes) => {
              console.log("Mistral response status:", fRes.statusCode);
              let fBody = "";
              fRes.on("data", (c) => (fBody += c));
              fRes.on("end", () => {
                try {
                  const mistralResponse = JSON.parse(fBody);
                  console.log("Mistral content:", mistralResponse.content);
                  // Add Mistral's enhanced description to the response
                  json.enhanced_description = mistralResponse.content;
                } catch (e) {
                  console.error("Failed to parse Mistral response:", e.message);
                }
            });
            });
            fReq.on("error", (e) =>
              console.error("Caption forward failed:", e.message)
            );
            const payload = JSON.stringify({ 
              prompt: `Make a funny caption for this image, one sentence 15 words max: ${json.caption}`,
              n_predict: 100
            });
            console.log("Sending to Mistral:", payload);
            fReq.write(payload);
            fReq.end();
          } 
          catch (e) {
            console.error("Failed to forward caption:", e.message);
          }
        }
        else {
          console.log("No EXTERNAL_CAPTION_URL set or no caption to forward.");
        }
        res.json(json);
      } catch (e) {
        res.status(500).json({ error: e.message, body });
      }
    });
  });

  request.on("error", (err) => res.status(500).json({ error: err.message }));
  request.write(payload);
  request.end();
});

//make sure THIS PORT is forwarded to the ngrok port
app.listen(3001, () => console.log("Proxy running on port 3001"));
