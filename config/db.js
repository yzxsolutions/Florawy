import mongoose from "mongoose";

const ConnectDB = async (url) => {
  try {
    const response = await mongoose.connect(url);
    console.log("MongodB ==> ",response.connection.host);
  } catch (error) {
    console.log("MONGO DB Connection Error ==> ", error);
  }
}


export default ConnectDB;