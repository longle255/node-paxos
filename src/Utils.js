import fs from 'fs';

export default class Utils {
  static getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  static getRandomString(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
  static readFileToArraySync(file) {
    return fs.readFileSync(file).toString().split('\n');
  }

  static readFileToArray(file, callback) {
    fs.readFile(file, function(err, data) {
      if (err) {
        return callback(err);
      }
      return callback(null, data.toString().split('\n'));
    });
  }
}
