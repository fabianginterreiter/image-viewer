"use strict"

var console = process.console;

class SessionAction {
  constructor(database) {
    this.database = database; 
  }

  set(session, user, callback) {
    session.user = user;
    callback(null, user);
  }

  get(session, callback) {
    if (session.user) {
      callback(null, session.user);
    } else {
      callback(null, {});
    }
  }

  delete(session, callback) {
    session.user = null;
    callback(null, {});
  }
}

module.exports = SessionAction;