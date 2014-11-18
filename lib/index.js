/**
 * Modified from the Connect project: https://github.com/senchalabs/connect/blob/master/lib/middleware/errorHandler.js
 *
 * Sample on:
 * http://mikevalstar.com/Blog/105/Coding_with_Nodejs_Part_2_Error_Handling_and_404_pages_with_Express
 *
 * Source on:
 * https://github.com/mikevalstar/mikevalstar_com/lib
 *
 * Flexible error handler, providing (_optional_) stack traces and logging
 * and error message responses for requests accepting text, html, or json.
 *
 * Options:
 *
 *   - `showStack` respond with both the error message and stack trace. Defaults to `false`
 *   - `showMessage`, respond with the exception message only. Defaults to `false`
 *   - `dumpExceptions`, dump exceptions to stderr (without terminating the process). Defaults to `false`
 *   - `logErrors`, will dump a log entry and stack trace into the gievn file. Defaults to `false`
 *
 * Text:
 *   By default, and when _text/plain_ is accepted a simple stack trace
 *   or error message will be returned.
 *
 * JSON:
 *   When _application/json_ is accepted, connect will respond with
 *   an object in the form of `{ "error": error }`.
 *
 * HTML:
 *   When accepted connect will output a nice html stack trace.
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

var fs = require('fs');

exports = module.exports = function errorHandler(options) {
    options = options || {};
    // defaults
    var showStack = options.showStack
        , showMessage = options.showMessage
        , dumpExceptions = options.dumpExceptions
        , logErrors = options.logErrors;

    return function errorHandler(err, req, res, next) {
        if (dumpExceptions && err.stack) console.error(err.stack);

        if (logErrors) {
            var now = new Date();
            fs.appendFile(logErrors, now.toJSON() + ' - Error Happened: \n' + err.stack + "\n", function(err, result) {
            });
        }

        var accept = req.headers.accept || '';
        if (showStack) {
            var error = err.message || err.toString();
            var stack = err.stack || '';

            // html
            if (~accept.indexOf('html')) {
                res.statusCode = 500;

                stack = stack.
                    replace(/&/g, '&amp;').
                    replace(/</g, '&lt;').
                    replace(/"/g, '&quot;').
                    replace(/'/g, '&#039;').
                    replace(/\n/g, '<br />');


                error = error.
                    replace(/&/g, '&amp;').
                    replace(/</g, '&lt;').
                    replace(/"/g, '&quot;').
                    replace(/'/g, '&#039;').
                    replace(/\n/g, '<br />');

                res.render('error.html', { stack: JSON.stringify(stack), error: JSON.stringify(error) });

            } else /* if (~accept.indexOf('json')) */ {
                res.json({ success: false, message: JSON.stringify(err) });
            } //else {
//                res.writeHead(500, { 'Content-Type': 'text/plain' });
//                res.end(err.stack);
//            }
        } else {
            // public error page render
            // html
            if (~accept.indexOf('html')) {
                res.render('error.html', options.defs);
                // json
            } else /*if (~accept.indexOf('json')) */{
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ succes: false, message: "There was a server error generating the content." }));
                // plain text
            } //else {
//                res.writeHead(500, { 'Content-Type': 'text/plain' });
//                res.end("500 - Server Error");
//            }
        }
    };
};