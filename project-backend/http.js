const http = require("http")

const myServer = http.createServer((req, res) => {
    console.log("request sent");
    res.end("hello hi");

    myServer.listen(8000, () => console.log("server start"));
});

myServer();



