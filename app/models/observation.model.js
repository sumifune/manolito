
module.exports = (mongoose, mongoosePaginate) => {

  var schema = mongoose.Schema(
  {
    note: String
    // madeBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Terapeuta'
    // },
 },
 { timestamps: true }
 );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  schema.plugin(mongoosePaginate);

  const Observation = mongoose.model("Observation", schema);
  return Observation;
};