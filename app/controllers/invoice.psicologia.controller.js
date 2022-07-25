const db = require("../models");
const moment = require('moment');

// const Patient = db.patients;
// const Invoice = db.invoices;
const InvoicePsicologia = db.invoicesPsicologia;
const Patient = db.patients;
const Service = db.services;

const expexcel = require('../libs/expexcelpsicologia');


const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

// Create and Save a new invoice
exports.create = (req, res) => {

  // console.log('post');

  // Validate request
  if (!req.body.emittedTo) {
    res.status(400).send({ message: "ID can not be empty!" });
    return;
  }
  if (!req.body.date) {
    res.status(400).send({ message: "Date can not be empty!" });
    return;
  }
  if (!req.body.concept) {
    res.status(400).send({ message: "Concept can not be empty!" });
    return;
  }
  if (!req.body.name) {
    res.status(400).send({ message: "Name can not be empty!" });
    return;
  }
  if (!req.body.surname) {
    res.status(400).send({ message: "Surname can not be empty!" });
    return;
  }
  if (!req.body.address) {
    res.status(400).send({ message: "Address can not be empty!" });
    return;
  }
  if (!req.body.dni) {
    res.status(400).send({ message: "DNI can not be empty!" });
    return;
  }
  if (!req.body.iva) {
    res.status(400).send({ message: "IVA can not be empty!" });
    return;
  }
  if (!req.body.base) {
    res.status(400).send({ message: "Base can not be empty!" });
    return;
  }
  if (!req.body.total) {
    res.status(400).send({ message: "Total can not be empty!" });
    return;
  }
  if (!req.body.inumber) {
    res.status(400).send({ message: "InvoicePsicologia number can not be empty!" });
    return;
  }

  // Transform date
  let qsdate = moment(req.body.date, "DD-MM-YYYY");
  let mongoDate = moment(qsdate).format('YYYY-MM-DD');


  // console.log(mongoDate);

  // Create a invoice
  const invoice = new InvoicePsicologia({
    emittedTo: req.body.emittedTo,
    date: mongoDate,
    concept: req.body.concept,
    name: req.body.name,
    surname: req.body.surname,
    address: req.body.address,
    dni: req.body.dni,
    iva: req.body.iva,
    base: req.body.base,
    total: req.body.total,
    inumber: req.body.inumber,
  });

  // Save InvoicePsicologia in the database
  invoice
  .save(invoice)
  .then(t => t.populate('emittedTo').execPopulate())
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while creating the invoice."
    });
  });
};



exports.createTrans = (req, res) => {

  // Validate request
  if (!req.body.emittedTo) {
    res.status(400).send({ message: "ID can not be empty!" });
    return;
  }
  if (!req.body.sessions) {
    res.status(400).send({ message: "Sessions can not be empty!" });
    return;
  }
  if (!req.body.concept) {
    res.status(400).send({ message: "Concept can not be empty!" });
    return;
  }


  function round(value){
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
  // Transform date
  // let qsdate = moment(req.body.date, "DD-MM-YYYY");
  // let mongoDate = moment(qsdate).format('YYYY-MM-DD');

  InvoicePsicologia.findOne({}).sort('-createdAt').exec(function(err, invoice){

    // if (invoice)
    //   console.log(typeof moment(invoice.createdAt).format('YYYY'));

    let nextInumber = 0;
    let currentYear = String(new Date().getFullYear());
    // console.log(currentYear);

    if (err) {
      res.status(500).send({
        message:
        err.message || "Some error occurred while creating the invoice."
      });
      return;
    }

    if (!invoice) {
      console.log('No invoices in DB');
      nextInumber = 1;
    }else if(invoice && moment(invoice.createdAt).format('YYYY') !== currentYear){
      console.log('diffent years');
      nextInumber = 1;
    }else if (invoice && (moment(invoice.createdAt).format('YYYY') === currentYear)) {
      console.log('increment');
      nextInumber = parseInt(invoice.inumber, 10) + 1;
    }


    // Get personal detail from patient
    Patient.findById(req.body.emittedTo)
    .then(patient => {
      if (!patient)
        res.status(404).send({ message: "Not found patient with emittedTo " + req.body.emittedTo });
      else{
		    // Get service info
		    Service
		    .findById(req.body.concept)
		    .then(service => {
		      if (!service)
		        res.status(404).send({ message: "Not found service with concept " + req.body.concept });
		      else{

            // https://www.tuspapelesempresa.com/calcular-base-imponible-a-partir-total-factura/
            // Calculo del factor de base
            let fb = ( parseFloat(service.iva) / 100 ) + 1;

            let total = parseFloat(req.body.sessions) * parseFloat(service.cost);
            // Calculo de la BI
            let base = total / fb;
            // Round
            let roundedBase = round(base);
            // Check
            let ivaPart = round(roundedBase * (parseFloat(service.iva) / 100));

            let ivaBaseSum = ivaPart + roundedBase;

            // console.log("ivaBaseSum " + ivaBaseSum);
            // console.log("total " + total);
            if (ivaBaseSum !== total) {
              console.log('Fiscal check failed------------------------------------- ');
              console.log('total ' + total);
              console.log('ivaBaseSum ' + ivaBaseSum);
              console.log('---------------------------------------------------------');
            }

		        // Create a invoice
		        const newInvoicePsicologia = new InvoicePsicologia({
		          emittedTo: req.body.emittedTo,
		          serviceID: service.id,
		          concept: service.name,
		          name: patient.name,
		          surname: patient.surname,
		          address: patient.address,
		          city: patient.city,
		          sessions: req.body.sessions,
              cost: service.cost,
		          dni: patient.dni,
		          iva: service.iva,
		          base: roundedBase,
		          total: total,
		          inumber: nextInumber,
		        });

		        // Save InvoicePsicologia in the database
		        newInvoicePsicologia
		        .save(newInvoicePsicologia)
		        .then(t => t.populate('emittedTo').execPopulate())
		        .then(data => {
		          res.send(data);
		        })
		        .catch(err => {
		          res.status(500).send({
		            message:
		            err.message || "Some error occurred while creating the invoice."
		          });
		        });

		      }
		    })
		    .catch(err => {
		    	console.log(err);
		      res
		      .status(500)
		      .send({ message: "Error retrieving service with id=" + req.body.concept });
		    });

      }
    })
    .catch(err => {
      res
      .status(500)
      .send({ message: "Error retrieving patienttt with id=" + req.body.emittedTo,
      "errr": err });
    });

  });

};

exports.downloadExcel = (req, res) => {
// router.get('/:id/download', function (req, res, next) {
    var filePath = "./exports/Psicologia.xlsx"; // Or format the path using the `id` rest param
    var fileName = "Psicologia.xlsx"; // The default name the browser will use
    res.download(filePath, fileName);
// });
    // console.log('No deberia dde llegar hasta aqui'); //... pero llega

};

// Retrieve all invoices from the database.
exports.generateExcel = (req, res) => {
  const { page, size, surname, date1, date2 } = req.query;

  let momentDate1 = moment(date1, "DD-MM-YYYY");
  let momentDate2 = moment(date2, "DD-MM-YYYY");

  let mongoDate1 = moment(momentDate1).format('YYYY-MM-DD');
  let mongoDate2 = moment(momentDate2).format('YYYY-MM-DD');


  let qdate1 = moment(mongoDate1).add(0,'days');
  let qdate2 = moment(mongoDate2).add(0,'days');


  let dateCondition = (date1 && date2) ? {
      createdAt: {
        $gte: qdate1.startOf('day').toDate(),
        $lte: qdate2.endOf('day').toDate()
      }
    } : {};


  let surnameCondition = surname ? { surname: { $regex: new RegExp(surname), $options: "i" } } : {};

  let condition = {...dateCondition, ...surnameCondition};

  // const { limit, offset } = getPagination(page, size);
  // const populate = { populate: 'emittedTo', lean: true, sort: { 'createdAt': 1 } };

  InvoicePsicologia.paginate(condition, { pagination: false }, function(err, invs) {

    expexcel.createExcel(invs)
      .then((data) => {
        res.send({ estate: true });
      })
      .catch((err) => {
        res.status(500).send({ estate: false });
    });

  });

};

// Retrieve all invoices from the database.
exports.findAll = (req, res) => {
  const { page, size, surname, date1, date2 } = req.query;
  // var condition = surname
  // ? { surname: { $regex: new RegExp(surname), $options: "i" } }
  // : {};

  // console.log(surname);
  // console.log(date1);
  // console.log(date2);


  let momentDate1 = moment(date1, "DD-MM-YYYY");
  let momentDate2 = moment(date2, "DD-MM-YYYY");

  let mongoDate1 = moment(momentDate1).format('YYYY-MM-DD');
  let mongoDate2 = moment(momentDate2).format('YYYY-MM-DD');


  let qdate1 = moment(mongoDate1).add(0,'days');
  let qdate2 = moment(mongoDate2).add(0,'days');


  let dateCondition = (date1 && date2) ? {
      createdAt: {
        $gte: qdate1.startOf('day').toDate(),
        $lte: qdate2.endOf('day').toDate()
      }
    } : {};


  let surnameCondition = surname ? { surname: { $regex: new RegExp(surname), $options: "i" } } : {};

  let condition = {...dateCondition, ...surnameCondition};
  // let condition = {...dateCondition};

  // console.log(condition);
  // condition = {};

  const { limit, offset } = getPagination(page, size);
  const populate = { populate: 'emittedTo', lean: true, sort: { 'createdAt': 1 } };

  // console.log({ offset, limit, ...populate });

  function amount(item){

    if (item.estate === "emitted")
      return item.total;
    else
      return 0;
  }

  function sum(prev, next){
    return prev + next;
  }



  InvoicePsicologia.paginate(condition, { pagination: false }, function(err, invs) {

    let totalInvoices = 0;
    let numberInvoices = 0;
    let numCanInvoices = 0;
    if (invs) {
      totalInvoices = invs.docs.map(amount).reduce(sum);
      // console.log(invs.docs.map(amount).reduce(sum));
      numberInvoices = invs.docs.filter((item) => item.estate === "emitted").length;
      numCanInvoices = invs.docs.filter((item) => item.estate === "cancelled").length;
    }

    InvoicePsicologia.paginate(condition, { offset, limit, ...populate })
    .then((data) => {
      // console.log(data);
      res.send({
        totalItems: data.totalDocs,
        invoices: data.docs,
        totalPages: data.totalPages,
        currentPage: data.page - 1,
        totalInvoices: totalInvoices,
        numberInvoices: numberInvoices,
        numCanInvoices: numCanInvoices,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
        err.message || "Some error occurred while retrieving invoices.",
      });
    });

  });

};

// Retrieve all invoices by date from the database.
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

  InvoicePsicologia.find(condition)
  .populate('emittedTo')
  .then((data) => {
    // console.log(data);
    res.send({
      invoices: data,
    });
  })
  .catch((err) => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving invoices.",
    });
  });
};
//
exports.findAllByPatientId = (req, res) => {
  const { page, size } = req.query;
  const id = req.params.id;
  const condition = { emittedTo: id };

  InvoicePsicologia.find(condition).populate('emittedTo')
  .then((data) => {
    // console.log(data);
    res.send({
      invoices: data,
    });
  })
  .catch((err) => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving invoices.",
    });
  });
};

// Retrieve all invoices for the next five dates
// exports.findAllByDateNext = (req, res) => {
//   const { page, size, date } = req.query;

//   let momentDate = moment(date, "DD-MM-YYYY");
//   let mongoDate = moment(momentDate).format('YYYY-MM-DD');

//   const queryDB = (condition) => {
//     const query = InvoicePsicologia.find(condition).populate('emittedTo')
//     const promise = query.exec();
//     return promise;
//   }

//   let arrayOfPromises = [];
//   for (let i=0; i<5; i++) {

//     let qdate = moment(mongoDate).add(i,'days');
//     let cond = {
//       date: {
//         $gte: qdate.startOf('day').toDate(),
//         $lte: qdate.endOf('day').toDate()
//       }
//     };
//     // console.log(cond);
//     arrayOfPromises.push(queryDB(cond));
//   }

//   Promise.all(arrayOfPromises)
//   .then(response => {
//     // console.log(response);
//     res.send({
//       nextFiveDates: response
//     });
//   });

// };

// Find a single invoices with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  // console.log('aadadadsd');

  InvoicePsicologia.findById(id)
  .populate('emittedTo')
  .then(data => {
    if (!data)
      res.status(404).send({ message: "Not found invoice with id " + id });
    else res.send(data);
  })
  .catch(err => {
    res
    .status(500)
    .send({ message: "Error retrieving invoice with id=" + id });
  });
};

// Update a InvoicePsicologia by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  InvoicePsicologia.findByIdAndUpdate(id, req.body, { new: true, useFindAndModify: false })
  .populate('emittedTo')
  .then(data => {
    if (!data) {
      res.status(404).send({
        message: `Cannot update invoice with id=${id}. Maybe invoice was not found!`
      });
    } else {
      res.send(data);
      //res.send({ message: "InvoicePsicologia was updated successfully." });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating invoice with id=" + id
    });
  });
};

// Delete a invoice with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  InvoicePsicologia.findByIdAndRemove(id)
  .then(data => {
    if (!data) {
      res.status(404).send({
        message: `Cannot delete invoice with id=${id}. Maybe invoice was not found!`
      });
    } else {
      res.send({
        message: "InvoicePsicologia was deleted successfully!"
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Could not delete invoice with id=" + id
    });
  });
};

// Delete all invoice from the database.
exports.deleteAll = (req, res) => {
  InvoicePsicologia.deleteMany({})
  .then(data => {
    res.send({
      message: `${data.deletedCount} InvoicePsicologias were deleted successfully!`
    });
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while removing all invoice."
    });
  });
};

// Find all emitted invoices
// exports.findAllEmitted = (req, res) => {
//   const { page, size } = req.query;
//   const { limit, offset } = getPagination(page, size);
//   const populate = { populate: 'emittedTo', lean: true };

//   InvoicePsicologia.paginate({ estate: "emitted" }, { offset, limit, ...populate })
//   .then((data) => {
//     res.send({
//       totalItems: data.totalDocs,
//       invoices: data.docs,
//       totalPages: data.totalPages,
//       currentPage: data.page - 1,
//     });
//   })
//   .catch((err) => {
//     res.status(500).send({
//       message:
//       err.message || "Some error occurred while retrieving invoices.",
//     });
//   });
// };