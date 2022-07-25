const db = require("../models");
const moment = require('moment');

// const Patient = db.patients;
const Appointment = db.appointments;

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

// Create and Save a new Appointment
exports.create = (req, res) => {
  // Validate request
  if (!req.body.date) {
    res.status(400).send({ message: "Date can not be empty!" });
    return;
  }
  if (!req.body.hour) {
    res.status(400).send({ message: "Hour can not be empty!" });
    return;
  }
  if (!req.body.service) {
    res.status(400).send({ message: "Service can not be empty!" });
    return;
  }
  if (!req.body.madeBy) {
    res.status(400).send({ message: "MadeBy can not be empty!" });
    return;
  }

  // Transform date
  let qsdate = moment(req.body.date, "DD-MM-YYYY");
  let mongoDate = moment(qsdate).format('YYYY-MM-DD');

  // console.log(mongoDate);

  // Create a Appointment
  const appointment = new Appointment({
    date: mongoDate,
    hour: req.body.hour,
    service: req.body.service,
    madeBy: req.body.madeBy
  });


//   Appointment.findByIdAndUpdate(id, req.body, { new: true, useFindAndModify: false })
  // .populate('madeBy')



 // t.save().then(t => t.populate('my-path').execPopulate())
  // Save Appointment in the database
  appointment
  .save(appointment)
  .then(t => t.populate('madeBy').execPopulate())
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while creating the appointment."
    });
  });
};

// Retrieve all appointments from the database.
exports.findAll = (req, res) => {
  const { page, size, surname } = req.query;
  // var condition = surname
  // ? { surname: { $regex: new RegExp(surname), $options: "i" } }
  // : {};

  const condition = {};
  const { limit, offset } = getPagination(page, size);
  const populate = { populate: 'madeBy', lean: true };

  // console.log({ offset, limit, ...populate });

  Appointment.paginate(condition, { offset, limit, ...populate })
  .then((data) => {
    // console.log(data);
    res.send({
      totalItems: data.totalDocs,
      appointments: data.docs,
      totalPages: data.totalPages,
      currentPage: data.page - 1,
    });
  })
  .catch((err) => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving appointments.",
    });
  });
};

// Retrieve all appointments by date from the database.
exports.findAllByDate = (req, res) => {
  const { page, size, date } = req.query;

  let momentDate = moment(date, "DD-MM-YYYY");
  let mongoDate = moment(momentDate).format('YYYY-MM-DD');

  let qdate = moment(mongoDate).add(0,'days');

  let condition = {
    date: {
      $gte: qdate.startOf('day').toDate(),
      $lte: qdate.endOf('day').toDate()
    }
  };

  // console.log(condition);

  Appointment.find(condition)
  .populate('madeBy')
  .then((data) => {
    console.log(data);
    res.send({
      appointments: data,
    });
  })
  .catch((err) => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving appointments.",
    });
  });
};
//
exports.findAllByPatientId = (req, res) => {
  const { page, size } = req.query;
  const id = req.params.id;
  const condition = { madeBy: id };

  Appointment.find(condition).populate('madeBy')
  .then((data) => {
    console.log(data);
    res.send({
      appointments: data,
    });
  })
  .catch((err) => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving appointments.",
    });
  });
};

// Retrieve all appointments for the next five dates
exports.findAllByDateNext = (req, res) => {
  const { page, size, date } = req.query;

  let momentDate = moment(date, "DD-MM-YYYY");
  let mongoDate = moment(momentDate).format('YYYY-MM-DD');

  const queryDB = (condition) => {
    const query = Appointment.find(condition).populate('madeBy')
    const promise = query.exec();
    return promise;
  }

  let arrayOfPromises = [];
  for (let i=0; i<5; i++) {

    let qdate = moment(mongoDate).add(i,'days');
    let cond = {
      date: {
        $gte: qdate.startOf('day').toDate(),
        $lte: qdate.endOf('day').toDate()
      }
    };
    // console.log(cond);
    arrayOfPromises.push(queryDB(cond));
  }

  Promise.all(arrayOfPromises)
  .then(response => {
    // console.log(response);
    res.send({
      nextFiveDates: response
    });
  });

};

// Find a single Appointment with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Appointment.findById(id)
  .populate('madeBy')
  .then(data => {
    if (!data)
      res.status(404).send({ message: "Not found appointment with id " + id });
    else res.send(data);
  })
  .catch(err => {
    res
    .status(500)
    .send({ message: "Error retrieving appointment with id=" + id });
  });
};

// Update a Appointment by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  Appointment.findByIdAndUpdate(id, req.body, { new: true, useFindAndModify: false })
  .populate('madeBy')
  .then(data => {
    if (!data) {
      res.status(404).send({
        message: `Cannot update appointment with id=${id}. Maybe appointment was not found!`
      });
    } else {
      res.send(data);
      //res.send({ message: "Appointment was updated successfully." });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating appointment with id=" + id
    });
  });
};

// Delete a Appointment with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Appointment.findByIdAndRemove(id)
  .then(data => {
    if (!data) {
      res.status(404).send({
        message: `Cannot delete appointment with id=${id}. Maybe appointment was not found!`
      });
    } else {
      res.send({
        message: "Appointment was deleted successfully!"
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Could not delete appointment with id=" + id
    });
  });
};

// Delete all appointment from the database.
exports.deleteAll = (req, res) => {
  Appointment.deleteMany({})
  .then(data => {
    res.send({
      message: `${data.deletedCount} Appointments were deleted successfully!`
    });
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while removing all appointment."
    });
  });
};

// Find all active appointment
exports.findAllPending = (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);
  const populate = { populate: 'madeBy', lean: true };

  Appointment.paginate({ estate: "pending" }, { offset, limit, ...populate })
  .then((data) => {
    res.send({
      totalItems: data.totalDocs,
      appointments: data.docs,
      totalPages: data.totalPages,
      currentPage: data.page - 1,
    });
  })
  .catch((err) => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving appointments.",
    });
  });
};