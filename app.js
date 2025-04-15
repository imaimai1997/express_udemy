const PORT = process.env.PORT || 3000;
const path = require("path");
const express = require("express");
const app = express();

//Express setting
app.set("view engine", "ejs");

//Static resource rooting
//publicにアクセスしたとき、現在のパスから相対パスであるpublicからファイルを探して返す。
app.use("/public", express.static(path.join(__dirname, "/public")));

//Dynamic resource rooting
app.use("/", require("./routes/index.js"));

app.listen(PORT, () => {
  console.log(`Application listening at ${PORT}`);
});
