node-example
=========
In this example, the nodejs server connect to postgresql-db, insert two message into the db and then listen on 8080 port. When user access the nodejs server, the server getback the info from db and send to user.
# Usage this example:

$ osadm new-project test

$ osc process -f nodejs-template-stibuild.json | osc create -f - -n test

$ osc get bc -n test
NAME                  TYPE      SOURCE
nodejs-sample-build   Source    git://github.com/mdshuai/nodejs-example.git

$ osc start-build nodejs-sample-build -n test

$ osc get se -n test
NAME       LABELS                                   SELECTOR        IP(S)           PORT(S)
database   template=application-template-stibuild   name=database   172.30.99.105   5432/TCP
frontend   template=application-template-stibuild   name=frontend   172.30.39.105   8080/TCP

$ curl 172.30.39.105:8080
Hello, Get data from postgreql : 
[
    {
        "type": "nodejs",
        "version": "0.10"
    },
    {
        "type": "postgresql",
        "version": "9.2"
    }
]
