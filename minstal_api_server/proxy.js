const express = require("express");
const http = require("http");

const app = express();
app.use(express.json());

const LLM_HOST = "localhost";
const LLM_PORT = 11434;

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

//make sure THIS PORT is forwarded to the ngrok port
app.listen(3000, () => console.log("Proxy running on port 3000"));
