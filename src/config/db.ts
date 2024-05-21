import mongoose from 'mongoose'

const dbUrl = process.env.DATABASE_URL as string
const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl)
    console.log('Database connected successfully')
  } catch (err) {
    console.log(err)
  }
}

export default connectDB
