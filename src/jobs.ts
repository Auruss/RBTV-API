import g = require('./global');
import winston = require("winston");

export interface Job {
    execute(config: g.Schedule);
}

interface JobDirectory {
    [name: string]: Job;
}
var _jobs: JobDirectory = {};

export function addJob(name: string) {
    _jobs[name] = {
        execute(config: g.Schedule) {
            winston.log('info', 'Job "' + name + '" is being executed!');

            try {
                var path = 'dev/src/jobs/' + name + '.js';
                var proc = require('child_process').spawn(config.engine, [path]);

                proc.stdout.on('data', function (data) {
                    console.log('job stdout: ' + data);
                });

                proc.stderr.on('data', function (data) {
                    console.log('job stderr: ' + data);
                });
            } catch (e) {
                winston.log('error', 'Job "' + name + '" failed to execute', { exception: e });
            }
        }
    };
}

export function getJob(name: string): Job {
    return _jobs[name];
}

export function startScheduler() {
    for (var schedule in g.Config.schedule) {
        var config = g.Config.schedule[schedule];

        setInterval(() => {
            getJob(config.job).execute(config);
        }, config.minutes * 60 * 1000);
    }
}
