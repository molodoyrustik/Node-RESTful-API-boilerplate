(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('babel-runtime/regenerator'), require('babel-runtime/helpers/asyncToGenerator'), require('babel-runtime/core-js/object/keys'), require('babel-runtime/core-js/promise'), require('babel-runtime/core-js/object/assign'), require('babel-runtime/helpers/classCallCheck'), require('babel-runtime/helpers/createClass'), require('bunyan'), require('express'), require('mongoose'), require('babel-runtime/core-js/json/stringify'), require('left-pad'), require('cookie-parser'), require('body-parser'), require('cors'), require('uuid'), require('lodash'), require('jsonwebtoken'), require('bcryptjs'), require('bluebird'), require('babel-runtime/helpers/extends'), require('express-jwt'), require('uniqid'), require('crypto'), require('nodemailer'), require('nodemailer-smtp-transport'), require('express-async-router')) :
	typeof define === 'function' && define.amd ? define(['babel-runtime/regenerator', 'babel-runtime/helpers/asyncToGenerator', 'babel-runtime/core-js/object/keys', 'babel-runtime/core-js/promise', 'babel-runtime/core-js/object/assign', 'babel-runtime/helpers/classCallCheck', 'babel-runtime/helpers/createClass', 'bunyan', 'express', 'mongoose', 'babel-runtime/core-js/json/stringify', 'left-pad', 'cookie-parser', 'body-parser', 'cors', 'uuid', 'lodash', 'jsonwebtoken', 'bcryptjs', 'bluebird', 'babel-runtime/helpers/extends', 'express-jwt', 'uniqid', 'crypto', 'nodemailer', 'nodemailer-smtp-transport', 'express-async-router'], factory) :
	(factory(global._regeneratorRuntime,global._asyncToGenerator,global._Object$keys,global._Promise,global._Object$assign,global._classCallCheck,global._createClass,global.bunyan,global.express,global.mongoose,global._JSON$stringify,global.leftPad,global.cookieParser,global.bodyParser,global.cors,global.uuid,global._,global.jwt,global.bcrypt,global.Promise,global._extends,global.jwt$1,global.uniqid,global.crypto,global.nodemailer,global.smtpTransport,global.expressAsyncRouter));
}(this, (function (_regeneratorRuntime,_asyncToGenerator,_Object$keys,_Promise,_Object$assign,_classCallCheck,_createClass,bunyan,express,mongoose,_JSON$stringify,leftPad,cookieParser,bodyParser,cors,uuid,_,jwt,bcrypt,Promise,_extends,jwt$1,uniqid,crypto,nodemailer,smtpTransport,expressAsyncRouter) { 'use strict';

_regeneratorRuntime = 'default' in _regeneratorRuntime ? _regeneratorRuntime['default'] : _regeneratorRuntime;
_asyncToGenerator = 'default' in _asyncToGenerator ? _asyncToGenerator['default'] : _asyncToGenerator;
_Object$keys = 'default' in _Object$keys ? _Object$keys['default'] : _Object$keys;
_Promise = 'default' in _Promise ? _Promise['default'] : _Promise;
_Object$assign = 'default' in _Object$assign ? _Object$assign['default'] : _Object$assign;
_classCallCheck = 'default' in _classCallCheck ? _classCallCheck['default'] : _classCallCheck;
_createClass = 'default' in _createClass ? _createClass['default'] : _createClass;
bunyan = 'default' in bunyan ? bunyan['default'] : bunyan;
express = 'default' in express ? express['default'] : express;
mongoose = 'default' in mongoose ? mongoose['default'] : mongoose;
_JSON$stringify = 'default' in _JSON$stringify ? _JSON$stringify['default'] : _JSON$stringify;
leftPad = 'default' in leftPad ? leftPad['default'] : leftPad;
cookieParser = 'default' in cookieParser ? cookieParser['default'] : cookieParser;
bodyParser = 'default' in bodyParser ? bodyParser['default'] : bodyParser;
cors = 'default' in cors ? cors['default'] : cors;
uuid = 'default' in uuid ? uuid['default'] : uuid;
_ = 'default' in _ ? _['default'] : _;
jwt = 'default' in jwt ? jwt['default'] : jwt;
bcrypt = 'default' in bcrypt ? bcrypt['default'] : bcrypt;
Promise = 'default' in Promise ? Promise['default'] : Promise;
_extends = 'default' in _extends ? _extends['default'] : _extends;
jwt$1 = 'default' in jwt$1 ? jwt$1['default'] : jwt$1;
uniqid = 'default' in uniqid ? uniqid['default'] : uniqid;
crypto = 'default' in crypto ? crypto['default'] : crypto;
nodemailer = 'default' in nodemailer ? nodemailer['default'] : nodemailer;
smtpTransport = 'default' in smtpTransport ? smtpTransport['default'] : smtpTransport;

global.__DEV__ = true;
// __STAGE__
global.__PROD__ = false;

var config = {
  name: 'Your super app',
  port: 3001,
  db: {
    url: 'mongodb://localhost/test'
  },
  jwt: {
    secret: 'YOUR_SECRET'
  },
  nodemailer: {
    service: 'mail',
    host: 'smtp.mail.ru',
    auth: {
      user: 'molodoyrustik@mail.ru',
      pass: 'molodoy'
    }
  }
};

function levelFn(data) {
  if (data.err || data.status >= 500 || data.duration > 10000) {
    // server internal error or error
    return 'error';
  } else if (data.status >= 400 || data.duration > 3000) {
    // client error
    return 'warn';
  }
  return 'info';
}

function logStart(data) {
  return leftPad(data.method, 4) + ' ' + data.url + ' started reqId=' + data.reqId;
}

function logFinish(data) {
  var time = (data.duration || 0).toFixed(3);
  var length = data.length || 0;
  return leftPad(data.method, 4) + ' ' + data.url + ' ' + leftPad(data.status, 3) + ' ' + leftPad(time, 7) + 'ms ' + leftPad(length, 5) + 'b reqId=' + data.reqId;
}

var accessLogger = (function (params) {
  return [function (req, res, next) {
    var data = {};
    if (!req.log) throw 'has no req.log!';
    var log = req.log.child({
      component: 'req'
    });

    data.reqId = req.reqId;
    data.method = req.method;
    if (req.ws) data.method = 'WS';
    data.host = req.headers.host;
    data.url = (req.baseUrl || '') + (req.url || '-');
    data.referer = req.header('referer') || req.header('referrer');
    data.ip = req.ip || req.connection.remoteAddress || req.socket && req.socket.remoteAddress || req.socket.socket && req.socket.socket.remoteAddress || '127.0.0.1';

    if (__DEV__) {
      log.debug(data, logStart(data));
      if (req.body) {
        log.trace(_JSON$stringify(req.body));
      }
    }

    var hrtime = process.hrtime();
    function logging() {
      data.status = res.statusCode;
      data.length = res.getHeader('Content-Length');

      var diff = process.hrtime(hrtime);
      data.duration = diff[0] * 1e3 + diff[1] * 1e-6;

      log[levelFn(data)](data, logFinish(data));
    }
    res.on('finish', logging);
    res.on('close', logging);
    next();
  }];
});

var reqParser = (function (ctx) {
  return [bodyParser.json(), bodyParser.urlencoded({ extended: true }), cookieParser(), cors()];
});

var catchError = (function (ctx) {
  return function (err, req, res, next) {
    if (req && req.log && req.log.error) {
      req.log.error({
        err: err,
        query: req.query,
        body: req.body,
        headers: req.headers
      }, (err || {}).stack);
    } else {
      console.log(err);
    }
    res.status(err.status || 500);
    return res.json([]);
    if (res.err) return res.err(err);
    return res.json(err);
  };
});

var reqLog = (function (params) {
  return [function (req, res, next) {
    if (__PROD__) {
      req.reqId = uuid.v4();
    } else {
      global.reqId = 1 + (global.reqId || 0);
      req.reqId = global.reqId;
    }
    if (params.log) {
      req.log = params.log.child({
        reqId: req.reqId
      });
    }
    next();
  }];
});

var extendReqRes = (function (ctx) {
  return [function (req, res, next) {
    if (ctx.requests) {
      _.forEach(ctx.requests, function (val, key) {
        req[key] = val.bind(req);
      });
      // if (req.allParams) {
      //   req.params = req.allParams.bind(req)()
      // }
    }
    if (ctx.responses) {
      _.forEach(ctx.responses, function (val, key) {
        res[key] = val.bind(res);
      });
    }
    next();
  }];
});

// fs
var _getMiddlewares = function (ctx) {
  return {
    accessLogger: accessLogger.apply(undefined, arguments),
    reqParser: reqParser.apply(undefined, arguments),
    catchError: catchError.apply(undefined, arguments),
    reqLog: reqLog.apply(undefined, arguments),
    extendReqRes: extendReqRes.apply(undefined, arguments)
  };
};

var bcryptGenSalt = Promise.promisify(bcrypt.genSalt);
var bcryptHash = Promise.promisify(bcrypt.hash);
var bcryptCompare = Promise.promisify(bcrypt.compare);
var User = (function (ctx) {
  if (!ctx.log) throw '!log';

  var schema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      trim: true
    },
    id: {
      type: String,
      trim: true
    },
    password: {
      type: String
    },
    forgotEmailToken: {
      type: String,
      trim: true
    }
  }, {
    collection: 'user',
    timestamps: true
  });

  schema.statics.isValidEmail = function (email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };
  schema.statics.generatePassword = function () {
    var length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;

    return Math.random().toString(36).substr(2, length);
  };
  schema.methods.toJSON = function () {
    return _.omit(this.toObject(), ['password']);
  };
  schema.methods.getIdentity = function (params) {
    var object = _.pick(this.toObject(), ['_id', 'email', 'id']);
    if (!params) return object;
    return _Object$assign(object, params);
  };
  schema.methods.generateAuthToken = function (params) {
    return jwt.sign(this.getIdentity(params), ctx.config.jwt.secret);
  };
  schema.methods.verifyPassword = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(password) {
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return bcryptCompare(password, this.password);

            case 2:
              return _context.abrupt('return', _context.sent);

            case 3:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x2) {
      return _ref.apply(this, arguments);
    };
  }();

  var SALT_WORK_FACTOR = 10;
  schema.pre('save', function (next) {
    var _this = this;

    if (!this.isModified('password')) return next();
    return bcryptGenSalt(SALT_WORK_FACTOR).then(function (salt) {
      bcryptHash(_this.password, salt).then(function (hash) {
        _this.password = hash;
        next();
      });
    }).catch(next);
  });

  return mongoose.model('User', schema);
});

var _getModels = function () {
  return {
    User: User.apply(undefined, arguments)
  };
};

var Auth = (function (ctx) {
  var User = ctx.models.User;

  var transporter = ctx.utils.Transporter;

  var controller = {};

  controller.validate = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(req, res) {
      var user;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!req.user) {
                _context.next = 7;
                break;
              }

              _context.next = 3;
              return User.findOne({ id: req.user.id });

            case 3:
              user = _context.sent;

              if (user) {
                _context.next = 6;
                break;
              }

              return _context.abrupt('return', res.status(404).json([{ validate: false, message: 'Пользователь не найден в базе' }]));

            case 6:
              return _context.abrupt('return', [{
                validate: true,
                __pack: 1,
                jwt: req.user,
                user: user
              }]);

            case 7:
              return _context.abrupt('return', res.status(404).json([{ validate: false, message: 'Пользователь не найден в базе' }]));

            case 8:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();

  controller.getUserFields = function (req) {
    return req.body;
  };

  controller.validationUserFields = function (userFields, res) {
    var valid = {
      isValid: false,
      message: []
    };

    if (!userFields.captcha) {
      valid.isValid = true;
      valid.message = [{ signup: false, message: 'Параметр captcha не передан или введен неверно' }];
    }

    if (!userFields.email || !userFields.password) {
      valid.isValid = true;
      valid.message = [{ signup: false, message: 'Параметрs email или password не передан' }];
    }

    return valid;
  };

  controller.getUserCriteria = function (req, res) {
    var params = req.body;
    if (params.email) {
      return {
        email: params.email
      };
    }
    return res.status(400).json([{ signup: false, message: 'Параметр email не передан' }]);
  };

  controller.signup = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(req, res) {
      var userFields, valid, criteria, existUser, user, result;
      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              userFields = controller.getUserFields(req, res);
              valid = controller.validationUserFields(userFields, res);

              if (!valid.isValid) {
                _context2.next = 5;
                break;
              }

              return _context2.abrupt('return', res.status(400).json(valid.message));

            case 5:
              criteria = controller.getUserCriteria(req, res);
              _context2.next = 8;
              return User.findOne(criteria);

            case 8:
              existUser = _context2.sent;

              if (!existUser) {
                _context2.next = 11;
                break;
              }

              return _context2.abrupt('return', res.status(400).json([{ signup: false, message: 'Такой email зарегистрирован' }]));

            case 11:
              user = new User(_extends({}, userFields, {
                id: uniqid(),
                forgotEmailToken: ''
              }));
              _context2.next = 14;
              return user.save();

            case 14:
              result = [{
                signup: true,
                user: user,
                token: user.generateAuthToken()
              }];
              return _context2.abrupt('return', res.json(result));

            case 18:
              _context2.prev = 18;
              _context2.t0 = _context2['catch'](0);

              console.log(_context2.t0);
              return _context2.abrupt('return', res.status(500).json(_context2.t0));

            case 22:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this, [[0, 18]]);
    }));

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }();

  controller.login = function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(req, res) {
      var params, criteria, user;
      return _regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              params = controller.getUserFields(req, res);

              if (params.password) {
                _context3.next = 3;
                break;
              }

              return _context3.abrupt('return', res.status(400).json([{ login: false, message: 'Параметр password не передан' }]));

            case 3:
              criteria = controller.getUserCriteria(req);
              _context3.next = 6;
              return User.findOne(criteria);

            case 6:
              user = _context3.sent;

              if (user) {
                _context3.next = 9;
                break;
              }

              return _context3.abrupt('return', res.status(404).json([{ login: false, message: 'Такой пользователь не найден' }]));

            case 9:
              _context3.next = 11;
              return user.save();

            case 11:
              _context3.next = 13;
              return user.verifyPassword(params.password);

            case 13:
              if (_context3.sent) {
                _context3.next = 15;
                break;
              }

              return _context3.abrupt('return', res.status(400).json([{ login: false, message: 'Переданный пароль не подходит' }]));

            case 15:
              return _context3.abrupt('return', res.json([{
                __pack: 1,
                login: true,
                user: user,
                token: user.generateAuthToken()
              }]));

            case 16:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    return function (_x5, _x6) {
      return _ref3.apply(this, arguments);
    };
  }();

  controller.forgot = function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(req, res) {
      var params, criteria, user, token, siteUrl, mailText, mailOptions, result;
      return _regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              params = controller.getUserFields(req, res);

              if (params.email) {
                _context4.next = 3;
                break;
              }

              return _context4.abrupt('return', res.status(400).json([{ forgot: false, message: 'Параметр email не передан' }]));

            case 3:
              if (params.captcha) {
                _context4.next = 5;
                break;
              }

              return _context4.abrupt('return', res.status(400).json([{ forgot: false, message: 'Параметр captcha не передан' }]));

            case 5:
              criteria = controller.getUserCriteria(req);
              _context4.next = 8;
              return User.findOne(criteria);

            case 8:
              user = _context4.sent;

              if (user) {
                _context4.next = 11;
                break;
              }

              return _context4.abrupt('return', res.status(404).json([{ login: false, message: 'Пользователь с таким email не найден в базе' }]));

            case 11:
              _context4.next = 13;
              return crypto.randomBytes(32);

            case 13:
              token = _context4.sent;


              user.forgotEmailToken = token.toString('hex');
              _context4.next = 17;
              return user.save();

            case 17:
              siteUrl = 'http://localhost:3000/';

              if (__PROD__) {
                siteUrl = 'http://app.ashlie.io/';
              }

              mailText = '\u041F\u0435\u0440\u0435\u0439\u0434\u0438\u0442\u0435 \u043F\u043E \u0441\u0441\u044B\u043B\u043A\u0435 \u0447\u0442\u043E\u0431\u044B \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C ' + siteUrl + 'auth/forgot/' + user.forgotEmailToken;
              mailOptions = {
                from: 'molodoyrustik@mail.ru',
                to: user.email,
                subject: 'Восстановления пароля сайта Ashile.io',
                text: mailText
              };
              _context4.next = 23;
              return transporter.sendMail(mailOptions);

            case 23:
              result = [{
                __pack: 1,
                forgot: true
              }];
              return _context4.abrupt('return', res.json(result));

            case 25:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    return function (_x7, _x8) {
      return _ref4.apply(this, arguments);
    };
  }();

  controller.checkForgotToken = function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(req, res) {
      var forgotEmailToken, criteria, user;
      return _regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              forgotEmailToken = req.params.forgotEmailToken;

              console.log(forgotEmailToken);

              if (forgotEmailToken) {
                _context5.next = 4;
                break;
              }

              return _context5.abrupt('return', res.status(400).json([{ checkForgotToken: false, message: 'Токен не был передан' }]));

            case 4:
              criteria = { forgotEmailToken: forgotEmailToken };
              _context5.next = 7;
              return User.findOne(criteria);

            case 7:
              user = _context5.sent;

              if (user) {
                _context5.next = 10;
                break;
              }

              return _context5.abrupt('return', res.status(404).json([{ checkForgotToken: false, message: 'Пользователь с таким токеном не найден' }]));

            case 10:
              return _context5.abrupt('return', res.json([{
                __pack: 1,
                checkForgotToken: true
              }]));

            case 11:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    return function (_x9, _x10) {
      return _ref5.apply(this, arguments);
    };
  }();

  controller.reset = function () {
    var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6(req, res) {
      var params, password, checkPassword, captcha, forgotEmailToken, criteria, user;
      return _regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              params = controller.getUserFields(req, res);
              password = params.password, checkPassword = params.checkPassword, captcha = params.captcha, forgotEmailToken = params.forgotEmailToken;

              if (password) {
                _context6.next = 4;
                break;
              }

              return _context6.abrupt('return', res.status(400).json([{ reset: false, message: 'Параметр password не передан' }]));

            case 4:
              if (checkPassword) {
                _context6.next = 6;
                break;
              }

              return _context6.abrupt('return', res.status(400).json([{ reset: false, message: 'Параметр checkPassword не передан' }]));

            case 6:
              if (!(password !== checkPassword)) {
                _context6.next = 8;
                break;
              }

              return _context6.abrupt('return', res.status(400).json([{ reset: false, message: 'Пароли не совпадают' }]));

            case 8:
              if (captcha) {
                _context6.next = 10;
                break;
              }

              return _context6.abrupt('return', res.status(400).json([{ reset: false, message: 'Параметр captcha не передан' }]));

            case 10:
              if (forgotEmailToken) {
                _context6.next = 12;
                break;
              }

              return _context6.abrupt('return', res.status(400).json([{ reset: false, message: 'Параметр forgotEmailToken не передан' }]));

            case 12:
              criteria = { forgotEmailToken: forgotEmailToken };
              _context6.next = 15;
              return User.findOne(criteria);

            case 15:
              user = _context6.sent;

              if (user) {
                _context6.next = 18;
                break;
              }

              return _context6.abrupt('return', res.status(404).json([{ reset: false, message: 'Не корректный токен' }]));

            case 18:
              user.forgotEmailToken = '';
              user.password = password;

              _context6.next = 22;
              return user.save();

            case 22:
              return _context6.abrupt('return', res.json([{
                __pack: 1,
                reset: true
              }]));

            case 23:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));

    return function (_x11, _x12) {
      return _ref6.apply(this, arguments);
    };
  }();

  controller.getToken = function (req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    } else if (req.headers['x-access-token']) {
      return req.headers['x-access-token'];
    } else if (req.query && req.query.token) {
      return req.query.token;
    } else if (req.cookies && req.cookies.token) {
      return req.cookies.token;
    }
    if (__DEV__ && ctx.config && ctx.config.jwt && ctx.config.jwt.devToken) return ctx.config.jwt.devToken;
    return null;
  };

  controller.parseToken = function (req, res, next) {
    var token = controller.getToken(req);
    req.token = token;
    next();
  };

  controller.parseUser = function (req, res, next) {
    var options = {
      secret: ctx.config && ctx.config.jwt.secret || 'SECRET',
      getToken: function getToken(req) {
        return req.token;
      }
    };
    jwt$1(options)(req, res, function (err) {
      if (err) req._errJwt = err;
      next();
    });
  };

  controller.isAuth = function (req, res, next) {
    if (req._errJwt) return next(req._errJwt);
    if (!req.user || !req.user._id) return res.status(401).send('!req.user');
    next();
  };

  return controller;
});

var Domain = (function (ctx) {
  var User = ctx.models.User;
  var Domain = ctx.models.Domain;

  var controller = {};

  controller.domains = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(req, res) {
      var userID, user;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              userID = req.user.id;
              _context.next = 3;
              return User.findOne({ id: userID });

            case 3:
              user = _context.sent;
              return _context.abrupt('return', res.json(user.domains));

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();

  controller.create = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(req, res) {
      var params, url, channels, userID, user, domain;
      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              params = req.body;

              if (params.url) {
                _context2.next = 3;
                break;
              }

              return _context2.abrupt('return', res.status(400).json([{ signup: false, message: 'Домен не передан' }]));

            case 3:
              if (params.channels) {
                _context2.next = 5;
                break;
              }

              return _context2.abrupt('return', res.status(400).json([{ signup: false, message: 'Каналы не переданы' }]));

            case 5:
              url = params.url, channels = params.channels;
              userID = req.user.id;
              _context2.next = 9;
              return User.findOne({ id: userID });

            case 9:
              user = _context2.sent;
              domain = new Domain({ url: url, id: uniqid(), channels: channels });

              user.domains.push(domain);
              _context2.next = 14;
              return user.save();

            case 14:
              return _context2.abrupt('return', res.json([{ flag: true, message: 'Домен успешно добавлен' }]));

            case 15:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }();

  controller.edit = function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(req, res) {
      var params, url, id, userID, user;
      return _regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              params = req.body;

              if (params.url) {
                _context3.next = 3;
                break;
              }

              return _context3.abrupt('return', res.status(400).json([{ signup: false, message: 'Домен не передан' }]));

            case 3:
              if (params.id) {
                _context3.next = 5;
                break;
              }

              return _context3.abrupt('return', res.status(400).json([{ signup: false, message: 'Id домена не передан' }]));

            case 5:
              url = params.url, id = params.id;
              userID = req.user.id;
              _context3.next = 9;
              return User.findOne({ id: userID });

            case 9:
              user = _context3.sent;

              user.domains.find(function (domain) {
                return domain.id === id;
              }).url = url;
              _context3.next = 13;
              return user.save();

            case 13:
              return _context3.abrupt('return', res.json([{ flag: true, message: 'Домен успешно изменен' }]));

            case 14:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    return function (_x5, _x6) {
      return _ref3.apply(this, arguments);
    };
  }();

  controller.delete = function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(req, res) {
      var id, userID, user;
      return _regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (req.params.id) {
                _context4.next = 2;
                break;
              }

              return _context4.abrupt('return', res.status(400).json([{ signup: false, message: 'Id домена не передан' }]));

            case 2:
              id = req.params.id;
              userID = req.user.id;
              _context4.next = 6;
              return User.findOne({ id: userID });

            case 6:
              user = _context4.sent;

              user.domains = user.domains.filter(function (domain) {
                return domain.id != id;
              });
              _context4.next = 10;
              return user.save();

            case 10:
              return _context4.abrupt('return', res.json([{ flag: true, message: 'Домен успешно удален' }]));

            case 11:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    return function (_x7, _x8) {
      return _ref4.apply(this, arguments);
    };
  }();

  controller.logs = function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(req, res) {
      var domainId, userID, user, domain, logs;
      return _regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              if (req.params.domainId) {
                _context5.next = 2;
                break;
              }

              return _context5.abrupt('return', res.status(400).json([{ signup: false, message: 'Id домена не передан' }]));

            case 2:
              domainId = req.params.domainId;
              userID = req.user.id;
              _context5.next = 6;
              return User.findOne({ id: userID });

            case 6:
              user = _context5.sent;

              if (user) {
                _context5.next = 9;
                break;
              }

              return _context5.abrupt('return', res.status(400).json([{ signup: false, message: 'Пользователь не найден' }]));

            case 9:
              domain = user.domains.find(function (domain) {
                return domain.id === domainId;
              });
              logs = domain.logs;
              return _context5.abrupt('return', res.json([{ flag: true, logs: logs }]));

            case 12:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    return function (_x9, _x10) {
      return _ref5.apply(this, arguments);
    };
  }();

  return controller;
});

var Channel = (function (ctx) {
  var User = ctx.models.User;
  var Channel = ctx.models.Channel;

  var controller = {};

  controller.getChannels = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(req, res) {
      var userID, user;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              userID = req.user.id;
              _context.next = 3;
              return User.findOne({ id: userID });

            case 3:
              user = _context.sent;
              return _context.abrupt('return', res.json(user.channels));

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();

  controller.create = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(req, res) {
      var params, type, endpoint, userID, user, channel;
      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              params = req.body;

              if (params.type) {
                _context2.next = 3;
                break;
              }

              return _context2.abrupt('return', res.status(400).json([{ flag: false, message: 'type не передан' }]));

            case 3:
              if (params.endpoint) {
                _context2.next = 5;
                break;
              }

              return _context2.abrupt('return', res.status(400).json([{ flag: false, message: 'endpoint не передан' }]));

            case 5:
              type = params.type, endpoint = params.endpoint;
              userID = req.user.id;
              _context2.next = 9;
              return User.findOne({ id: userID });

            case 9:
              user = _context2.sent;
              channel = new Channel({ id: uniqid(), type: type, endpoint: endpoint });

              user.channels.push(channel);
              _context2.next = 14;
              return user.save();

            case 14:
              return _context2.abrupt('return', res.json([{ flag: true, message: 'Channel успешно добавлен' }]));

            case 15:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }();

  controller.edit = function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(req, res) {
      var params, type, endpoint, userID, user;
      return _regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              params = req.body;

              if (params.type) {
                _context3.next = 3;
                break;
              }

              return _context3.abrupt('return', res.status(400).json([{ flag: false, message: 'type не передан' }]));

            case 3:
              if (params.endpoint) {
                _context3.next = 5;
                break;
              }

              return _context3.abrupt('return', res.status(400).json([{ flag: false, message: 'endpoint не передан' }]));

            case 5:
              type = params.type, endpoint = params.endpoint;
              userID = req.user.id;
              _context3.next = 9;
              return User.findOne({ id: userID });

            case 9:
              user = _context3.sent;

              channel = user.channels.find(function (channel) {
                return channel.id === id;
              });
              channel.type = type;
              channel.endpoint = endpoint;
              _context3.next = 15;
              return user.save();

            case 15:
              return _context3.abrupt('return', res.json([{ flag: true, message: 'Канал успешно изменен' }]));

            case 16:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    return function (_x5, _x6) {
      return _ref3.apply(this, arguments);
    };
  }();

  controller.delete = function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(req, res) {
      var id, userID, user;
      return _regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (req.params.id) {
                _context4.next = 2;
                break;
              }

              return _context4.abrupt('return', res.status(400).json([{ flag: false, message: 'Id канала не передан' }]));

            case 2:
              id = req.params.id;
              userID = req.user.id;
              _context4.next = 6;
              return User.findOne({ id: userID });

            case 6:
              user = _context4.sent;

              user.channels = user.channels.filter(function (channel) {
                return channel.id != id;
              });
              _context4.next = 10;
              return user.save();

            case 10:
              return _context4.abrupt('return', res.json([{ flag: true, message: 'Канал успешно удален' }]));

            case 11:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    return function (_x7, _x8) {
      return _ref4.apply(this, arguments);
    };
  }();

  return controller;
});

var _getControllers = function () {
  return {
    Auth: Auth.apply(undefined, arguments),
    Domain: Domain.apply(undefined, arguments),
    Channel: Channel.apply(undefined, arguments)
  };
};

var Transporter = (function (ctx) {
  if (!ctx.log) throw '!log';

  var transporter = nodemailer.createTransport(smtpTransport(ctx.config.nodemailer));

  return transporter;
});

var _getUtils = function () {
  return {
    Transporter: Transporter.apply(undefined, arguments)
  };
};

var getAuth = (function (ctx) {
  if (!_.has(ctx, 'controllers.Auth.signup')) throw '!controllers.Auth.signup';
  if (!_.has(ctx, 'controllers.Auth.login')) throw '!controllers.Auth.login';
  if (!_.has(ctx, 'controllers.Auth.validate')) throw '!controllers.Auth.validate';
  if (!_.has(ctx, 'controllers.Auth.forgot')) throw '!controllers.Auth.forgot';
  if (!_.has(ctx, 'controllers.Auth.checkForgotToken')) throw '!controllers.Auth.checkForgotToken';
  if (!_.has(ctx, 'controllers.Auth.reset')) throw '!controllers.Auth.reset';

  var api = expressAsyncRouter.AsyncRouter();

  api.all('/validate', ctx.controllers.Auth.validate);
  api.post('/signup', ctx.controllers.Auth.signup);
  api.post('/login', ctx.controllers.Auth.login);
  api.post('/forgot', ctx.controllers.Auth.forgot);
  api.get('/forgot/:forgotEmailToken', ctx.controllers.Auth.checkForgotToken);
  api.post('/reset', ctx.controllers.Auth.reset);

  return api;
});

var getDomain = (function (ctx) {
  if (!_.has(ctx, 'controllers.Domain.domains')) throw '!controllers.Domain.domains';
  if (!_.has(ctx, 'controllers.Domain.create')) throw '!controllers.Domain.create';
  if (!_.has(ctx, 'controllers.Domain.delete')) throw '!controllers.Domain.delete';
  if (!_.has(ctx, 'controllers.Domain.edit')) throw '!controllers.Domain.edit';
  if (!_.has(ctx, 'controllers.Domain.logs')) throw '!controllers.Domain.logs';

  var api = expressAsyncRouter.AsyncRouter();

  api.get('/', ctx.controllers.Domain.domains);
  api.post('/', ctx.controllers.Domain.create);
  api.delete('/:id', ctx.controllers.Domain.delete);
  api.put('/', ctx.controllers.Domain.edit);
  api.get('/:domainId/logs', ctx.controllers.Domain.logs);

  return api;
});

var getApi = (function (ctx) {
	var api = expressAsyncRouter.AsyncRouter();

	api.all('/', function () {
		return { ok: true, version: '1.0.1' };
	});

	api.use('/auth', getAuth(ctx));
	api.use('/domains', jwt$1({ secret: ctx.config.jwt.secret }), getDomain(ctx));

	api.use('/', function (err, req, res, next) {
		return res.status(401).json([{ flag: false, message: 'Не авторизован' }]);
	});

	return api;
});

var App = function () {
  function App() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, App);

    _Object$assign(this, params);
    if (!this.log) this.log = this.getLogger();
    this.init();
  }

  _createClass(App, [{
    key: 'getLogger',
    value: function getLogger(params) {
      return bunyan.createLogger(_Object$assign({
        name: 'app',
        src: __DEV__,
        level: 'trace'
      }, params));
    }
  }, {
    key: 'getMiddlewares',
    value: function getMiddlewares() {
      return _getMiddlewares(this);
    }
  }, {
    key: 'getModels',
    value: function getModels() {
      return _getModels(this);
    }
  }, {
    key: 'getDatabase',
    value: function getDatabase() {
      var _this = this;

      return {
        run: function run() {
          new _Promise(function (resolve) {
            mongoose.connect(_this.config.db.url);
            resolve();
          });
        }
      };
    }
  }, {
    key: 'getControllers',
    value: function getControllers() {
      return _getControllers(this);
    }
  }, {
    key: 'getUtils',
    value: function getUtils() {
      return _getUtils(this);
    }
  }, {
    key: 'init',
    value: function init() {
      this.log.trace('App init');
      this.app = express();
      this.db = this.getDatabase();

      this.utils = this.getUtils();
      this.log.trace('utils', _Object$keys(this.utils));

      this.middlewares = this.getMiddlewares();
      this.log.trace('middlewares', _Object$keys(this.middlewares));

      this.models = this.getModels();
      this.log.trace('models', _Object$keys(this.models));

      this.controllers = this.getControllers();
      this.log.trace('controllers', _Object$keys(this.controllers));

      this.useMiddlewares();
      this.useRoutes();
      this.useDefaultRoute();
    }
  }, {
    key: 'useMiddlewares',
    value: function useMiddlewares() {
      this.app.use(this.middlewares.catchError);
      this.app.use(this.middlewares.reqLog);
      this.app.use(this.middlewares.accessLogger);
      this.app.use(this.middlewares.reqParser);

      this.app.use(this.controllers.Auth.parseToken);
      this.app.use(this.controllers.Auth.parseUser);
    }
  }, {
    key: 'useRoutes',
    value: function useRoutes() {
      var api = getApi(this);
      this.app.use('/api/v1', api);
    }
  }, {
    key: 'useDefaultRoute',
    value: function useDefaultRoute() {
      this.app.use(function (req, res, next) {
        var err = 'Route not found';
        next(err);
      });
    }
  }, {
    key: 'run',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
        var _this2 = this;

        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.log.trace('App run');
                _context.prev = 1;
                _context.next = 4;
                return this.db.run();

              case 4:
                _context.next = 9;
                break;

              case 6:
                _context.prev = 6;
                _context.t0 = _context['catch'](1);

                this.log.fatal(_context.t0);

              case 9:
                return _context.abrupt('return', new _Promise(function (resolve) {
                  _this2.app.listen(_this2.config.port, function () {
                    _this2.log.info('App "' + _this2.config.name + '" running on port ' + _this2.config.port + '!');
                    resolve(_this2);
                  });
                }));

              case 10:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[1, 6]]);
      }));

      function run() {
        return _ref.apply(this, arguments);
      }

      return run;
    }()
  }]);

  return App;
}();

var app = new App({ config: config });
app.run();

})));
//# sourceMappingURL=index.umd.js.map
