/**
 * Socket.io manager – lets any controller emit events to connected users.
 * The io instance is attached in index.js and retrieved here.
 */
let _io = null;

exports.setIo = (io) => { _io = io; };

/**
 * Emit a notification to a specific user (by their userId string).
 * Users join a room named after their own _id on connection.
 */
exports.emitNotification = (userId, notification) => {
  if (_io) {
    _io.to(userId.toString()).emit("notification", notification);
  }
};

/**
 * Emit a new message to a specific user.
 */
exports.emitMessage = (userId, message) => {
  if (_io) {
    _io.to(userId.toString()).emit("new_message", message);
  }
};
