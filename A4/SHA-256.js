const crypto = require('crypto');
const axios = require('axios');

exports.handler = async (event) => {
  console.log("Event value:", JSON.stringify(event));

  try {
    const { course_uri, action, value } = event;

    if (!value) {
      throw new Error("Invalid input data: 'value' is missing or undefined.");
    }

    const hashedValue = crypto.createHash('sha256').update(value, 'utf8').digest('hex');

    const response = {
      banner: "B00917801",
      result: hashedValue,
      arn: "arn:aws:lambda:us-east-1:448001105130:function:SHA-256",
      action: "sha256",
      value,
    };

    const postResponse = await axios.post('https://v7qaxwoyrb.execute-api.us-east-1.amazonaws.com/default/end', response);

    console.log("Response from /end:", postResponse.data);

    return response;
  } catch (error) {
    console.error("Error processing SHA-256 hash:", error);
    throw error;
  }
};
