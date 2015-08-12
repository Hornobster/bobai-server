/**
 * Created by carlovespa on 10/07/15.
 */
var crypto = require('crypto');

var genericUtils = {
    genInsertIntoQuery: function
        (table, row, queryParams) {
        queryParams.length = 0;

        var query = 'INSERT INTO ' + table + ' (';

        var columns = [];

        for (var col in row) {
            if (row.hasOwnProperty(col)) {
                columns.push(col);
                queryParams.push(row[col]);
            }
        }

        for (var i = 0; i < columns.length; i++) {
            query += columns[i];

            if (i < columns.length - 1) {
                query += ', '
            }
        }

        query += ') VALUES (';

        for (i = 0; i < queryParams.length; i++) {
            query += '$' + (i + 1);

            if (i < queryParams.length - 1) {
                query += ', ';
            }
        }

        query += ') RETURNING id';

        return query;
    },
    toISOString: function (date) {
        var pad = function (number) {
            var r = String(number);
            if (r.length === 1) {
                r = '0' + r;
            }
            return r;
        };

        return date.getUTCFullYear()
            + pad(date.getUTCMonth() + 1)
            + pad(date.getUTCDate())
            + 'T' + pad(date.getUTCHours())
            + pad(date.getUTCMinutes())
            + pad(date.getUTCSeconds())
            + 'Z';
    },
    genAWSS3Request: function (accessKeyID, accessKeySecret, bucketName, isoDate, filename) {
        var spliceDate = isoDate.slice(0, 8);

        var headers = {
            host: bucketName + '.s3.amazonaws.com',
            contentType: 'image/jpeg',
            xAmzAcl: 'public-read',
            xAmzAlgorithm: 'AWS4-HMAC-SHA256',
            xAmzCredential: accessKeyID + '/' + spliceDate + '/us-east-1/s3/aws4_request',
            xAmzDate: isoDate,
            xAmzExpires: '300',
            xAmzSignedHeaders: 'content-type;host;x-amz-acl'
        };

        var canonicalRequest = 'PUT\n' +
            '/' + filename + '\n' +
            'X-Amz-Algorithm=' + encodeURIComponent(headers.xAmzAlgorithm) + '&' +
            'X-Amz-Credential=' + encodeURIComponent(headers.xAmzCredential) + '&' +
            'X-Amz-Date=' + encodeURIComponent(headers.xAmzDate) + '&' +
            'X-Amz-Expires=' + encodeURIComponent(headers.xAmzExpires) + '&' +
            'X-Amz-SignedHeaders=' + encodeURIComponent(headers.xAmzSignedHeaders) + '\n' +
            'content-type:' + headers.contentType + '\n' +
            'host:' + headers.host + '\n' +
            'x-amz-acl:' + headers.xAmzAcl + '\n\n' +
            headers.xAmzSignedHeaders + '\n' +
            'UNSIGNED-PAYLOAD';

        var stringToSign = headers.xAmzAlgorithm + '\n' +
            headers.xAmzDate + '\n' +
            spliceDate + '/us-east-1/s3/aws4_request\n' +
            crypto.createHash('sha256').update(canonicalRequest).digest('hex');

        var DateKey = crypto.createHmac('sha256', 'AWS4' + accessKeySecret).update(spliceDate).digest('binary');
        var DateRegionKey = crypto.createHmac('sha256', DateKey).update('us-east-1').digest('binary');
        var DateRegionServiceKey = crypto.createHmac('sha256', DateRegionKey).update('s3').digest('binary');
        var SigningKey = crypto.createHmac('sha256', DateRegionServiceKey).update('aws4_request').digest('binary');

        var signature = crypto.createHmac('sha256', SigningKey).update(stringToSign).digest('hex');

        var url = 'https://' + bucketName + '.s3.amazonaws.com/' + filename +
            '?X-Amz-Algorithm=' + headers.xAmzAlgorithm +
            '&X-Amz-Credential=' + encodeURIComponent(accessKeyID + '/' + spliceDate + '/us-east-1/s3/aws4_request') +
            '&X-Amz-Date=' + isoDate +
            '&X-Amz-Expires=' + headers.xAmzExpires + // signed URL expires after 5 minutes
            '&X-Amz-SignedHeaders=' + headers.xAmzSignedHeaders +
            '&X-Amz-Signature=' + signature;

        return url;
    }
};

module.exports = genericUtils;
