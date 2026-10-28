const mongoose = require("mongoose")

mongoose.set("strictQuery", false)

const url = process.env.MONGODB_URI

console.log("connecting...")
mongoose
  .connect(url, { family: 4 })
  .then(() => {
    console.log("conntected to MongoDB")
  })
  .catch((error) => console.log("error connecting to MongoDB", error.message))

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: [true, "Name is mandatory filed"],
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function (v) {
        return /^d{2,3}-d+$/
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
    required: [true, "Number is mandatory field"],
  },
})

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model("Person", personSchema)
