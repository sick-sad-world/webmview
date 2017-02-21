let http = require('http');

// HttpError Class declaration
// ==================================================================
class HttpError extends Error {
  constructor(err) {
    if (typeof err === 'string') {
      err = {
        status: 404,
        message: err
      };
    } else if (typeof err === 'number') {
      err = { status: err };
    }

    let status = err.status || 500;
    let message = err.message || http.STATUS_CODES[status] || 'Undefined error';

    // Handle Mongoose validation error texts
    // ==================================================================
    if (err.errors) {
      message += ':'
      for (let key in err.errors) {
        if (err.errors.hasOwnProperty(key)) {
          message += ' ' + err.errors[key].message;
        }
      }
    }

    super(message);

    // Assign all required data to instance
    // ==================================================================
    this.type = err.name || 'HttpError';
    this.status = status;
    this.message = message;
  }

  // Convert to JSON-capable format to send on client
  // StackTrace is optional
  // ==================================================================
  toJSON(stack) {
    let result = {
      type: this.type,
      status: this.status,
      message: this.message
    }
    if (stack) {
      result.stack = {};
      this.stack.split(/\n/).forEach((line, i) => {
        result.stack[i] = line;
      });
    }
    return result
  }
}

module.exports = HttpError;