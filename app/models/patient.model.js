module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
      name: String,
      surname: String,
      address: String,
      city: String,
      dni: String,
      phone: String,
      email: String,
      description: String,
      signature: String,
      active: {
        type: Boolean,
        default: true
      },
      tutor1: String,
      tutor2: String,
      niftutor1: String,
      niftutor2: String,
      pddate: Date,
      pdok: {
        type: Boolean,
        default: false
      },
      observations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Observation'
      }],
    },
    { timestamps: true }
  );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  schema.plugin(mongoosePaginate);

  const Patient = mongoose.model("Patient", schema);
  return Patient;
};