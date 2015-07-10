/**
 * Created by carlovespa on 10/07/15.
 */

var genericUtils = {
    genInsertIntoQuery: function (table, row, queryParams) {
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

        query += ')';

        return query;
    }
};

module.exports = genericUtils;
