import orm = require('../orm');
import seq = require('sequelize');

var Show = orm.requireModel('shows');

export var Model = orm.define('schedule', {
    api_id: { type: seq.INTEGER },
    title: { type: seq.STRING },
    topic: { type: seq.STRING },
    api_showname: { type: seq.STRING },
    typeName: { type: seq.STRING },
    gameName: { type: seq.STRING },
    timeStart: { type: seq.DATE },
    timeEnd: { type: seq.DATE },
    duration: { type: seq.INTEGER }
});

Model.belongsTo(Show, {/*as: 'linkedShow', */foreignKey: 'show_id'});
Model.sync();
