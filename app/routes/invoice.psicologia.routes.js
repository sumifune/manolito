module.exports = app => {
  const invoicesPsicologia = require("../controllers/invoice.psicologia.controller.js");

  var router = require("express").Router();

  // Create a new invoice
  router.post("/", invoicesPsicologia.createTrans);

  // Retrieve all invoicesPsicologia
  router.get("/", invoicesPsicologia.findAll);

  // Generate Excel
  router.get("/genexcel", invoicesPsicologia.generateExcel);

  router.get("/downloadexcel", invoicesPsicologia.downloadExcel);


  // Retrieve all scheduled invoicesPsicologia on a date
  // router.get("/scheduled", invoicesPsicologia.findAllByDate);

  // Retrieve all scheduled invoicesPsicologia for the next five dates
  // router.get("/scheduled/next", invoicesPsicologia.findAllByDateNext);

	// invoicesPsicologia?patientid=${id}` -->  query string or path params ????
  // Retrieve all scheduled invoicesPsicologia by patients ID
  router.get("/patient/:id", invoicesPsicologia.findAllByPatientId);

  // canceled, emitted, payed
  // Retrieve all emitted invoicesPsicologia
  // router.get("/emitted", invoicesPsicologia.findAllEmitted);

  // Retrieve a single invoice with id
  router.get("/:id", invoicesPsicologia.findOne);

  // Update a invoice with id
  router.put("/:id", invoicesPsicologia.update);

  // Delete a invoice with id
  router.delete("/:id", invoicesPsicologia.delete);

  // Create a new invoice
  router.delete("/", invoicesPsicologia.deleteAll);

  app.use('/api/invoicesp', router);
};