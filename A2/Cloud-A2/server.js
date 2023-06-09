const protoLoader = require('@grpc/proto-loader');
const AWS = require('aws-sdk');
const grpc = require('grpc');

const packageDefinition = protoLoader.loadSync('./computeandstorage.proto');
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const { computeandstorage } = protoDescriptor;

AWS.config.update({
    accessKeyId: 'ASIAWQTXSLTVORLNOZXR',
    secretAccessKey: 'UgcMtZliAy/QHxX1NgvA8E6xX9W9oDFFW67T6LtX',
    sessionToken: 'FwoGZXIvYXdzEEwaDANv+Q9PxUtY68mB5SLAAdS/JNdf5YhVEAFXNdVVFXZA5+opBnIS2X/A4i0zGzr8PHwudLiloeD1w6CjMC+FvldeGuBP/uPEcCT+gVYDXqwHQFlr/Xf/y5guMb6Xa4vDq/xoUsf6aae4A3kM05Yg7iAg8W/3xfgqnuNh339TzcLima+Y+fX5/1yPw1kH9xiwMq4O8LkG90JdTtjibAfeVrppPppwlovg7FzA0SN0dS+bvhqhxA8DejxHCPOY8i1yaCxuKMVrV7sW7R28mTISFiiClIqkBjItd7kMjvi2Hh38oZybwAb3xPoPiHT1iEmvdM1/qCRLH5bZfmfa1XYaDcHwnEqX'
});

const server = new grpc.Server();

server.addService(computeandstorage.EC2Operations.service, {
    StoreData: function (call, callback) {
        const { data } = call.request;

        const s3 = new AWS.S3();
        const bucketName = 'a2b00917801';
        const fileName = 'file.txt';

        const params = {
            Bucket: bucketName,
            Key: fileName,
            Body: data,
        };

        s3.upload(params, function (err, uploadData) {
            if (err) {
                console.error('Error uploading file to S3:', err);
                callback(err);
            } else {
                console.log('File uploaded to S3:', uploadData.Location);

                const response = { s3uri: uploadData.Location };
                callback(null, response);
            }
        });
    },

    AppendData: function (call, callback) {
        const { data } = call.request;

        const s3 = new AWS.S3();
        const bucketName = 'a2b00917801';
        const fileName = 'file.txt';

        s3.getObject({ Bucket: bucketName, Key: fileName }, function (err, getObjectData) {
            if (err) {
                console.error('Error fetching existing file from S3:', err);
                callback(err);
            } else {
                const existingContent = getObjectData.Body.toString();
                const updatedContent = existingContent + data;

                s3.upload(
                    { Bucket: bucketName, Key: fileName, Body: updatedContent },
                    function (err, uploadData) {
                        if (err) {
                            console.error('Error appending data to file on S3:', err);
                            callback(err);
                        } else {
                            console.log('Data appended to file on S3:', uploadData.Location);
                            callback(null, {});
                        }
                    }
                );
            }
        });
    },

    DeleteFile: function (call, callback) {
        const { s3uri } = call.request;

        const bucketName = 'a2b00917801';
        const fileName = `file.txt`;

        const s3 = new AWS.S3();
        const params = {
            Bucket: bucketName,
            Key: fileName,
        };

        s3.deleteObject(params, function (err, deleteData) {
            if (err) {
                console.error('Error deleting file from S3:', err);
                callback(err);
            } else {
                console.log('File deleted from S3');
                callback(null, {}); // Empty response
            }
        });
    },
});

const port = 50051;
server.bind(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure());
server.start();

console.log(`gRPC server listening on port ${port}`);
