const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.patients = require("./patient.model.js")(mongoose, mongoosePaginate);
db.appointments = require("./appointment.model.js")(mongoose, mongoosePaginate);
db.invoices = require("./invoice.model.js")(mongoose, mongoosePaginate);
db.invoicesPsicologia = require("./invoicePsicologia.model.js")(mongoose, mongoosePaginate);
db.observations = require("./observation.model.js")(mongoose, mongoosePaginate);
db.services = require("./service.model.js")(mongoose, mongoosePaginate);

db.user = require("./user.model");
db.role = require("./role.model");

db.ROLES = ["user", "admin", "moderator"];


// let exp = require("./total.model.js")(mongoose, mongoosePaginate);


// console.log(exp);

// console.log(exp.Patient);


// db.patients = exp.Patient;
// db.appointments = exp.Appointment;


module.exports = db;