
module.exports = (mongoose, mongoosePaginate) => {

  var schema = mongoose.Schema(
  {
    emittedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient' // Reference to some PatientSchema
    },
    // date: Date,
    estate: {
      type: String,
      default: 'emitted'
    },
    serviceID: String,
    concept: String,
    name: String,
    surname: String,
    address: String,
    city: String,
    sessions: Number,
    cost: Number,
    dni: String,
    iva: Number,
    base: Number,
    total: Number,
    inumber: String
 },
 { timestamps: true }
 );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  schema.plugin(mongoosePaginate);

  const InvoicePsico = mongoose.model("InvoicePsico", schema);
  return InvoicePsico;
};