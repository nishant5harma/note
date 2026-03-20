// /src/script/test-script/custom-web.mock.js
import crypto from "crypto";
import fetch from "node-fetch";

const url =
  "https://superevidently-styleless-cyrus.ngrok-free.dev/api/leads/webhook/";

const secret = "supersecret123";
const body = JSON.stringify({
  responseId: "gform-123",
  email: "alice@example.com",
  phone: "+911234567890",
  name: "Alice Example",
});

const hmac = crypto.createHmac("sha256", secret).update(body).digest("hex");
const signature = `sha256=${hmac}`;

const r = await fetch(url, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-lead-source": "google_forms",
    "x-signature": signature,
  },
  body,
});
console.log(await r.text());
