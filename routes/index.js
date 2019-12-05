const Express = require('express');
const App = Express();
const Purchases = require('./controllers/purchase');

App.use('/purchase', Purchases);

module.exports = App;
