const bcrypt = require('bcryptjs');
const axios = require('axios');

exports.handler = async (event) => {
  console.log("Event value:", JSON.stringify(event));

  try {
    const { course_uri, action, value } = event;

    console.log("Input data:", JSON.stringify({ course_uri, action, value }));

    if (!value) {
      throw new Error("Invalid input data: 'value' is missing or undefined.");
    }

    const saltRounds = 10;
    const hashedValue = await bcrypt.hash(value, saltRounds);

    const response = {
      banner: "B00917801",
      result: hashedValue,
      arn: "arn:aws:lambda:us-east-1:448001105130:function:Bcrypt",
      action: "bcrypt",
      value,
    };

    const postResponse = await axios.post('https://v7qaxwoyrb.execute-api.us-east-1.amazonaws.com/default/end', response);

    console.log("Response from /end:", postResponse.data);

    return response;
  } catch (error) {
    console.error("Error processing bcrypt hash:", error);
    throw error;
  }
};
