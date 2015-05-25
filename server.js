#!/usr/bin/env node
var util = require('util');

var postgresql_user = process.env.POSTGRESQL_USER || process.env.postgresql_user || "user";
var postgresql_pass = process.env.POSTGRESQL_PASSWORD || process.env.postgresql_password || "pass";
var postgresql_ip = process.env.POSTGRESQL_IP || process.env.postgresql_ip || "localhost";
var postgresql_port = process.env.POSTGRESQL_PORT || process.env.postgresql_port || 5432;
var postgresql_db = process.env.POSTGRESQL_DATABASE || process.env.postgresql_database || "db";

if (postgresql_user == null || postgresql_pass == null || postgresql_ip == null || postgresql_db == null){
    console.log("Please check you have set the postgresql user/pass/db in nodejs-example container");
    return
}

var pg = require("pg");
//var conString = "pg://user:pass@localhost:5432/db";
var conString = util.format('pg://%s:%s@%s:%d/%s', postgresql_user,postgresql_pass,postgresql_ip,postgresql_port,postgresql_db);
console.log("conString is %s",conString);
var client = new pg.Client(conString);
client.connect();

client.query("CREATE TABLE IF NOT EXISTS cartridge(type varchar(64), version varchar(64))");
//client.query("INSERT INTO cartridge(type, version) values($1, $2)", ['nodejs', '0.10']);
client.query("INSERT INTO cartridge(type, version) SELECT $1, $2 WHERE NOT EXISTS (SELECT type FROM cartridge WHERE type = $3)",['nodejs', '0.10','nodejs']);
var query = client.query("INSERT INTO cartridge(type, version) SELECT $1, $2 WHERE NOT EXISTS (SELECT type FROM cartridge WHERE type = $3)",['postgresql', '9.2','postgresql']);
query.on('end', function() {
    client.end();
});

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
                var myquery = myclient.query("SELECT type, version FROM cartridge ORDER BY type, version");
                myquery.on("row", function (row, result) {
                    result.addRow(row);
                    //console.log(row)
                });
                myquery.on("end", function (result) {
                    myclient.end();
                    //console.log("end query");
                    res.write("Hello, Get data from postgreql : " + "\n");
                    res.write(JSON.stringify(result.rows, null, "    ") + "\n");
                    res.end();
                });
        });
});
server.listen(port);
console.log('Server running on ' + ip + ':' + port);

