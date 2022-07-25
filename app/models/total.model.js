module.exports = (mongoose, mongoosePaginate) => {
  var PatientSchema = mongoose.Schema(
    {
      name: String,
      surname: String,
      address: String,
      city: String,
      dni: String,
      phone: String,
      email: String,
      description: String,
      active: Boolean
    },
    { timestamps: true }
  );

  PatientSchema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  PatientSchema.plugin(mongoosePaginate);

  const Patient = mongoose.model("Patient", PatientSchema);
  // return Patient;
  // -------------------------------------------------------------------------------------------

  var AppointmentSchema = mongoose.Schema(
  {
    surname: String,
    madeBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient' // Reference to some PatientSchema
    },
    date: Date,
    estate: String,
    hour: String,
    service: String
 },
 { timestamps: true }
 );

  AppointmentSchema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  AppointmentSchema.plugin(mongoosePaginate);

  const Appointment = mongoose.model("Appointment", AppointmentSchema);
  // return Appointment;

  return {
    Patient: Patient,
    Appointment: Appointment
  }

};