// apps/backend/src/script/google/forms/AppScript.js
function onFormSubmit(e) {
  // Replace with your ngrok / production URL
  var url =
    "https://superevidently-styleless-cyrus.ngrok-free.dev/api/leads/webhook/";

  // Build a canonical JSON string for signing
  var payloadObj = {
    responseId: e.response.getId(),
    answers: e.response.getItemResponses().map(function (ir) {
      return {
        question: ir.getItem().getTitle(),
        answer: ir.getResponse(),
      };
    }),
  };
  var payload = JSON.stringify(payloadObj);

  // secret must match env WEBHOOK_SECRET_GOOGLE_FORMS on server
  var secret = "supersecret123";

  // Compute HMAC-SHA256 and convert to hex
  var signatureBytes = Utilities.computeHmacSha256Signature(payload, secret);
  var signatureHex = signatureBytes
    .map(function (byte) {
      var v = byte < 0 ? byte + 256 : byte;
      var s = v.toString(16);
      return s.length === 1 ? "0" + s : s;
    })
    .join("");
  var signatureHeader = "sha256=" + signatureHex;

  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-lead-source": "google_forms",
      "x-signature": signatureHeader,
    },
    payload: payload,
    muteHttpExceptions: true,
  };

  var resp = UrlFetchApp.fetch(url, options);
  Logger.log(
    "status: %s body: %s",
    resp.getResponseCode(),
    resp.getContentText()
  );
}
