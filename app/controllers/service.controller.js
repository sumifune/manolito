const db = require("../models");
const Service = db.services;
const moment = require('moment');

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

exports.create = (req, res) => {

  // Validate request
  if (!req.body.name) {
    res.status(400).send({ message: "Name can not be empty!" });
    return;
  }
  if ( (!req.body.iva && req.body.iva !==0 )|| (req.body.iva < 0) ) {
    res.status(400).send({ message: "IVA can not be empty!" });
    return;
  }

  if (!req.body.activity) {
    res.status(400).send({ message: "Activity can not be empty!" });
    return;
  }
  const service = new Service({
    name: req.body.name,
    iva: req.body.iva,
    cost: req.body.cost,
    activity: req.body.activity,
  });

  service
  .save(service)
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while creating the service."
    });
  });
};

exports.findAll = (req, res) => {
  // const { page, size, name } = req.query;
  // var condition = name
  // ? { name: { $regex: new RegExp(name), $options: "i" } }
  // : {};

  // const { limit, offset } = getPagination(page, size);

  // Service.paginate(condition, { offset, limit })
  Service.find({})
  .then((data) => {
    res.send({data});
  })
  .catch((err) => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving services.",
    });
  });
};

exports.findAllActivity = (req, res) => {
  // const { page, size, name } = req.query;
  // var condition = name
  // ? { name: { $regex: new RegExp(name), $options: "i" } }
  // : {};

  // const { limit, offset } = getPagination(page, size);

  // Service.paginate(condition, { offset, limit })

  const activity = req.query.activity;

  Service.find({ activity: activity })
  .then((data) => {
    res.send({data});
  })
  .catch((err) => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving services.",
    });
  });
};

exports.findOne = (req, res) => {
  const id = req.params.id;

  Service.findById(id)
  .then(data => {
    if (!data)
      res.status(404).send({ message: "Not found service with id " + id });
    else res.send(data);
  })
  .catch(err => {
    res
    .status(500)
    .send({ message: "Error retrieving service with id=" + id });
  });
};

exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  Service.findByIdAndUpdate(id, req.body, { new: true, useFindAndModify: false })
  .then(data => {
    if (!data) {
      res.status(404).send({
        message: `Cannot update service with id=${id}. Maybe service was not found!`
      });
    } else {
      res.send(data);
      // res.send({ message: "Service was updated successfully." });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating service with id=" + id
    });
  });
};

exports.delete = (req, res) => {
  const id = req.params.id;

  Service.findByIdAndRemove(id)
  .then(data => {
    if (!data) {
      res.status(404).send({
        message: `Cannot delete service with id=${id}. Maybe service was not found!`
      });
    } else {
      res.send({
        message: "Service was deleted successfully!"
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Could not delete service with id=" + id
    });
  });
};

exports.deleteAll = (req, res) => {
  Service.deleteMany({})
  .then(data => {
    res.send({
      message: `${data.deletedCount} Services were deleted successfully!`
    });
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while removing all services."
    });
  });
};