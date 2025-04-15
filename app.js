const PORT = process.env.PORT || 3000;
const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.use("/", require("./routes/index.js"));

app.listen(PORT, () => {
  console.log(`Application listening at ${PORT}`);
});
