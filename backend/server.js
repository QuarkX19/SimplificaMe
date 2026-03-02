const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("API SimplificaME funcionando");
});

app.listen(4000, () => {
  console.log("Servidor corriendo en puerto 4000");
});
