const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const LLM_HOST = "localhost";
const LLM_PORT = 11434;
const ANALYZE_HOST = "127.0.0.1"
const ANALYZE_PORT = 5000;

app.post("/v1/chat/completions", (req, res) => {
  const data = JSON.stringify({
    prompt: req.body.messages.map(m => `${m.role}: ${m.content}`).join("\n") + "\nassistant:",
    n_predict: 100
  });

  const options = {
    hostname: LLM_HOST,
    port: LLM_PORT,
    path: "/completion",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length
    }
  };

  const request = http.request(options, response => {
    let body = "";
    response.on("data", chunk => body += chunk);
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
  request.on("error", err => res.status(500).json({ error: err.message }));
  request.write(data);
  request.end();
});

// Accept image analysis requests from the web client and forward to local analyze service
app.post("/analyze", (req, res) => {
  const payload = JSON.stringify(req.body || {});

  const options = {
    hostname: ANALYZE_HOST,
    port: ANALYZE_PORT,
    path: "/analyze",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
      ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
    },
  };

  const request = http.request(options, (response) => {
    let body = "";
    response.on("data", (chunk) => (body += chunk));
    response.on("end", () => {
      try {
        const json = JSON.parse(body);

        // Optionally forward caption to external endpoint if configured
        if (process.env.EXTERNAL_CAPTION_URL && json && json.caption) {
          try {
            const { URL } = require("url");
            const target = new URL(process.env.EXTERNAL_CAPTION_URL);
            const proto = target.protocol === "https:" ? require("https") : http;
            const fOptions = {
              hostname: target.hostname,
              port: target.port || (target.protocol === "https:" ? 443 : 80),
              path: target.pathname + (target.search || ""),
              method: "POST",
              headers: { "Content-Type": "application/json" },
            };
            const fReq = proto.request(fOptions, (fRes) => {
              let fBody = "";
              fRes.on("data", (c) => (fBody += c));
              fRes.on("end", () => console.log("Forwarded caption response:", fBody));
            });
            fReq.on("error", (e) => console.error("Caption forward failed:", e.message));
            fReq.write(JSON.stringify({ caption: json.caption }));
            fReq.end();
          } catch (e) {
            console.error("Failed to forward caption:", e.message);
          }
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
app.listen(3000, () => console.log("Proxy running on port 3000"));
