import orm = require('../orm');
import seq = require('sequelize');

export var Model = orm.define('shows', {
    website_id: { type: seq.INTEGER },
    name: { type: seq.STRING },
    description: { type: seq.TEXT},
    image_url: { type: seq.STRING(512) },
    hashtag: { type: seq.STRING },
    schedule_date: { type: seq.STRING },
    schedule_time: { type: seq.STRING },
    is_live: { type: seq.BOOLEAN }
});
Model.sync();
