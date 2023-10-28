// Create web server
// 2016-01-13   PV

var http = require("http");
var url = require("url");
var fs = require("fs");
var qs = require("querystring");

var server = http.createServer(function (request, response) {
    console.log("Request: " + request.method + " " + request.url);
    var purl = url.parse(request.url, true);
    var pathname = purl.pathname;
    var query = purl.query;
    var filename = "." + pathname;
    var contenttype = "text/html";
    var content = "";

    switch (pathname) {
        case "/comments":
            switch (request.method) {
                case "GET":
                    content = fs.readFileSync("comments.json", "utf8");
                    break;
                case "POST":
                    var body = "";
                    request.on("data", function (data) {
                        body += data;
                        if (body.length > 1e6) request.connection.destroy();
                    });
                    request.on("end", function () {
                        var post = qs.parse(body);
                        var comments = JSON.parse(fs.readFileSync("comments.json", "utf8"));
                        comments.push({ "author": post.author, "text": post.text });
                        fs.writeFileSync("comments.json", JSON.stringify(comments, null, 4));
                        content = fs.readFileSync("comments.json", "utf8");
                        response.writeHead(200, { "Content-Type": "application/json" });
                        response.end(content);
                    });
                    break;
                default:
                    response.writeHead(405, { "Content-Type": "text/html" });
                    response.end("Method not allowed");
            }
            break;
        case "/comments.json":
            content = fs.readFileSync("comments.json", "utf8");
            break;
        case "/":
            content = fs.readFileSync("index.html", "utf8");
            break;
        default:
            content = "Unknown page";
            contenttype = "text/plain";
    }

    response.writeHead(200, { "Content-Type": contenttype });
    response.end(content);
});

server.listen(8080);
console.log("Server running at http://localhost:8080/");