module.exports = app => {
  const services = require("../controllers/service.controller.js");

  var router = require("express").Router();

  // Create a new service
  router.post("/", services.create);

  // Retrieve all services
  router.get("/", services.findAll);

  // Retrieve all services
  router.get("/area/", services.findAllActivity);

  // Retrieve a single service with id
  router.get("/:id", services.findOne);

  // Update a service with id
  router.put("/:id", services.update);

  // Delete a service with id
  router.delete("/:id", services.delete);

  // Create a new service
  router.delete("/", services.deleteAll);

  app.use('/api/services', router);
};