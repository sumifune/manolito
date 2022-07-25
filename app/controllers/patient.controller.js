const db = require("../models");
const Patient = db.patients;
const Observation = db.observations;
const moment = require('moment');

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

// Create and Save a new Patient
exports.create = (req, res) => {
  // Validate request
  if (!req.body.name) {
    res.status(400).send({ message: "Name can not be empty!" });
    return;
  }
  if (!req.body.surname) {
    res.status(400).send({ message: "Surname can not be empty!" });
    return;
  }
  // if (!req.body.address) {
  //   res.status(400).send({ message: "Address can not be empty!" });
  //   return;
  // }
  // if (!req.body.city) {
  //   res.status(400).send({ message: "City can not be empty!" });
  //   return;
  // }
  // if (!req.body.dni) {
  //   res.status(400).send({ message: "DNI can not be empty!" });
  //   return;
  // }
  if (!req.body.phone) {
    res.status(400).send({ message: "Phone can not be empty!" });
    return;
  }
  // if (!req.body.signature) {
  //   res.status(400).send({ message: "Signature can not be empty!" });
  //   return;
  // }
  // Create a Patient
  const patient = new Patient({
    name: req.body.name,
    surname: req.body.surname,
    address: req.body.address || "",
    city: req.body.city || "",
    dni: req.body.dni || "",
    phone: req.body.phone,
    email: req.body.email || "",
    description: req.body.description || "",
    // active: req.body.active ? req.body.active : false,
    // signature: req.body.signature
  });

  // Save Patient in the database
  patient
  .save(patient)
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while creating the patient."
    });
  });
};

// Retrieve all patients from the database.
exports.findAll = (req, res) => {
  const { page, size, surname } = req.query;
  var condition = surname
  ? { surname: { $regex: new RegExp(surname), $options: "i" } }
  : {};

  const { limit, offset } = getPagination(page, size);

  Patient.paginate(condition, { offset, limit })
  .then((data) => {
    res.send({
      totalItems: data.totalDocs,
      patients: data.docs,
      totalPages: data.totalPages,
      currentPage: data.page - 1,
    });
  })
  .catch((err) => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving patients.",
    });
  });
};

// Find a single Patient with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Patient.findById(id)
  .then(data => {
    // console.log(data);
    if (!data)
      res.status(404).send({ message: "Not found patient with id " + id });
    else res.send(data);
  })
  .catch(err => {
    res
    .status(500)
    .send({ message: "Error retrieving patient with id=" + id });
  });
};

// Find a single Patient with an id
exports.addObservation = (req, res) => {
  const id = req.params.id;
  const note = req.body.note;

  console.log("id: " + id);
  console.log("note: " + note);

  Patient.findById(id, function(err, patient) {
    if (err) return res.send(err);

    // Create a Patient
    const observation = new Observation({
      // date: moment().format('YYYY-MM-DD'),
      note: note
    });

    observation
    .save(observation)
    .then(observation => {
      // res.send(observation);
      patient.observations.push(observation);
      patient
      .save(patient)
      .then(p => p.populate('observations').execPopulate())
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
          err.message || "Some error occurred while adding an obs to patient."
        });
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
        err.message || "Some error occurred while adding an obs to observations."
      });
    });

    // patient
    // .save(function(err, updatedPatient) {
    //   if (err) return res.send(err);
    //   console.log(updatedPatient);
    //   res.json({ status : 'Observation saved' });
    // });

  });

};

exports.getObservations = (req, res) => {
  const id = req.params.id;

  Patient.findById(id)
  .populate('observations')
  .then(data => {
    if (!data)
      res.status(404).send({ message: "Not found patient with id " + id });
    else res.send(data.observations);
  })
  .catch(err => {
    res
    .status(500)
    .send({ message: "Error retrieving patient with id=" + id });
  });
};

exports.deleteObservation = (req, res) => {
  const id = req.params.id;
  const observationID = req.query.observation;

  Observation.findByIdAndRemove(observationID)
  .then(data => {
    if (!data){
      res.status(404).send({ message: "Not found observation with id " + id });
    }else {

      // Patient.findByIdAndUpdate(id_patient, req.body, { useFindAndModify: false })
      // .then(data => {
      //   if (!data) {
      //     res.status(404).send({
      //       message: `Cannot update patient with id=${id}. Maybe patient was not found!`
      //     });
      //   } else res.send({ message: "Patient was updated successfully." });
      // })
      // .catch(err => {
      //   res.status(500).send({
      //     message: "Error updating patient with id=" + id
      //   });
      // });

      Patient.findByIdAndUpdate(id,
          {$pull: {observations: observationID}},
          {safe: true, upsert: true},
          function(err, doc) {
              if(err){
                console.log(err);
                res.status(404).send({ message: "Error " + id });
              }else{
                //do stuff
                console.log(doc);
                res.send({ observation:  observationID });
              }
          }
      );
    }
  })
  .catch(err => {
    res
    .status(500)
    .send({ message: "Error retrieving patient with id=" + id });
  });
};


// Update a Patient by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  Patient.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
  .then(data => {
    if (!data) {
      res.status(404).send({
        message: `Cannot update patient with id=${id}. Maybe patient was not found!`
      });
    } else res.send({ message: "Patient was updated successfully." });
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating patient with id=" + id
    });
  });
};

// Delete a Patient with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Patient.findByIdAndRemove(id)
  .then(data => {
    if (!data) {
      res.status(404).send({
        message: `Cannot delete patient with id=${id}. Maybe patient was not found!`
      });
    } else {
      res.send({
        message: "Patient was deleted successfully!"
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Could not delete patient with id=" + id
    });
  });
};

// Delete all patients from the database.
exports.deleteAll = (req, res) => {
  Patient.deleteMany({})
  .then(data => {
    res.send({
      message: `${data.deletedCount} Patients were deleted successfully!`
    });
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while removing all patients."
    });
  });
};

// Find all active patients
exports.findAllActive = (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  Patient.paginate({ active: true }, { offset, limit })
  .then((data) => {
    res.send({
      totalItems: data.totalDocs,
      patients: data.docs,
      totalPages: data.totalPages,
      currentPage: data.page - 1,
    });
  })
  .catch((err) => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving patients.",
    });
  });
};