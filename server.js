#!/usr/bin/env node

var pg = require("pg");
var conString = "pg://user:pass@localhost:5432/db";
var client = new pg.Client(conString);
client.connect();

client.query("CREATE TABLE IF NOT EXISTS cartridge(type varchar(64), version varchar(64))");
//client.query("INSERT INTO cartridge(type, version) values($1, $2)", ['nodejs', '0.10']);
//client.query("INSERT INTO cartridge(type, version) values($1, $2)", ['postgresql', '9.2']);
client.end();

var http = require('http');
var url = require('url');
var port = process.env.PORT || process.env.port || process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var server = http.createServer(function (req, res) {
        var url_parts = url.parse(req.url, true);
        var body = '';
        req.on('data', function (data) {
                body += data;
        });
        req.on('end', function () {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                var myclient = new pg.Client(conString);
                myclient.connect();
                var query = myclient.query("SELECT type, version FROM cartridge ORDER BY type, version");
                query.on("row", function (row, result) {
                    result.addRow(row);
                    //console.log(row)
                });
                query.on("end", function (result) {
                    myclient.end();
                    //console.log("end query");
                    res.write(JSON.stringify(result.rows, null, "    ") + "\n");
                    res.end();
                });
        });
});
server.listen(port);
console.log('Server running on ' + ip + ':' + port);

