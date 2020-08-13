require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { port, env, dbURI, dbOPS } = require('./config/environment');
const mongoose = require('mongoose');
mongoose.plugin(require('./lib/globalToJSON'));
mongoose.Promise = require('bluebird');
const routes = require('./config/routes');
const customResponses = require('./lib/customResponses');
const errorHandler = require('./lib/errorHandler');

const app = express();

mongoose
  .connect(dbURI, dbOPS)
  .then(() => console.log('DB Connected'))
  .catch(err => console.log('DB Connection Failed', err));

if (env !== 'test') app.use(morgan('dev'));

app.use(express.static(`${ __dirname }/public`));
app.use(bodyParser.json({ limit: '5mb' }));

app.use(customResponses);

app.use('/api', routes);

app.get('/*', (req, res) => res.sendFile(`${ __dirname }/public/index.html`));

app.use(errorHandler);

app.listen(port, () => console.log(`Express is listening on port ${ port }`));
