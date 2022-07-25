const { authJwt } = require("../middlewares");
const invoices = require("../controllers/invoice.controller.js");

module.exports = app => {

  var router = require("express").Router();

  // Create a new invoice
  router.post("/", invoices.createTrans);

  // Retrieve all invoices
  router.get("/", invoices.findAll);

  // Generate Excel
  router.get("/genexcel", invoices.generateExcel);

  router.get("/downloadexcel", invoices.downloadExcel);


  // Retrieve all scheduled invoices on a date
  // router.get("/scheduled", invoices.findAllByDate);

  // Retrieve all scheduled invoices for the next five dates
  // router.get("/scheduled/next", invoices.findAllByDateNext);

	// invoices?patientid=${id}` -->  query string or path params ????
  // Retrieve all scheduled invoices by patients ID
  router.get("/patient/:id", invoices.findAllByPatientId);

  // canceled, emitted, payed
  // Retrieve all emitted invoices
  // router.get("/emitted", invoices.findAllEmitted);

  // Retrieve a single invoice with id
  router.get("/:id", invoices.findOne);

  // Update a invoice with id
  router.put("/:id", invoices.update);

  // Delete a invoice with id
  router.delete("/:id", invoices.delete);

  // Create a new invoice
  router.delete("/", invoices.deleteAll);


  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.use('/api/invoices',[authJwt.verifyToken, authJwt.isAdmin], router);
};