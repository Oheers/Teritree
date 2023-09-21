const http = require("http");

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Test 200")
});

server.listen(8000);