var console = process.console;

export class SessionAction {
  set(user, callback) {
    this.user = user;
    callback(null, {});
  }

  get(callback) {
    if (this.user) {
      callback(null, this.user);
    } else {
      callback(null, {});
    }
  }

  delete(callback) {
    this.user = null;
    callback(null, {});
  }
}