const Express = require('express');
const App = Express();
const Connection = require('./db/index');
const Routes = require('./routes/index');

Connection.connect((err) => {
    if(err) {
        console.log(`Error connecting: ${err}`);
        return;
    }
    console.log("Connected succesfully")
});


App.use(Express.json());
App.use('/api', Routes);

App.listen(3000, () => console.log("Listen in port 3000"));