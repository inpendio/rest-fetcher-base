(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('lodash')) :
  typeof define === 'function' && define.amd ? define(['exports', 'lodash'], factory) :
  (global = global || self, factory(global.reduxrestfetcher = {}, global.lodash));
}(this, function (exports, lodash) {
  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(source, true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(source).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  var EXCLUDED = ['body', 'expected', 'GET'];

  /**
   * @description Merges 2 object recursavly, overriding values from second to first object.
   * @param {Obect} obj1 - firs object, will be overriden
   * @param {Obect} obj2 - second object
   */

  var mergeTwo = function mergeTwo(obj1, obj2) {
    var _obj2 = obj2;
    var out = {};
    Object.keys(obj1).forEach(function (k) {
      if (_typeof(obj1[k]) === 'object' && obj1[k].constructor !== Array) {
        if (obj2[k] && _typeof(obj2[k]) === 'object') {
          out[k] = mergeTwo(obj1[k], obj2[k]);
        } else {
          out[k] = obj1[k];
        }
      } else if (obj1[k].constructor === Array) {
        out[k] = obj1[k];

        if (obj2[k] && obj2[k].constructor === Array) {
          out[k] = obj1[k].concat(obj2[k]);
        }
      } else if (obj2[k]) {
        out[k] = obj2[k];
      } else out[k] = obj1[k];

      delete _obj2[k];
    });
    out = Object.assign({}, out, _obj2);
    return out;
  };
  /**
   * @description Merges multiple objects recursevly
   * @param {Spread of objects} args
   */


  var deepMerge = function deepMerge() {
    var out = {};

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    args.forEach(function (e) {
      if (e.constructor === Object) out = mergeTwo(out, e);
    });
    return out;
  };
  /**
   * @description Helper function that converts js object to GET params string.
   * {id:'123', user:'some'} -> "?id=123&user=some"
   * @param {Object} getObj - object containing GET key value pairs
   * @memberof Communicator
   */

  var getGetParamsAsString = function getGetParamsAsString(getObj) {
    if (lodash.isEmpty(getObj)) return '';
    var out = '?';
    Object.keys(getObj).forEach(function (k, i) {
      if (_typeof(getObj[k]) !== 'object' && typeof getObj[k] !== 'function') {
        out = "".concat(out + (i !== 0 ? '&' : '') + k, "=").concat(getObj[k]);
      } else if (Array.isArray(getObj[k])) {
        out = "".concat(out + (i !== 0 ? '&' : '') + k, "=").concat(getObj[k].join(','));
      }
    });
    return out;
  };
  /**
   * @description Function used for constructing url and inserting parametars in to the
   * predefined holders.
   * @example
   * baseUrl = localhost
   * url = /url/:id
   * request = {id: '22'}
   * output = localhost/url/22
   * Function also accepts absolute url, in which case will skip adding base url.
   * Absoulute url must contain http:// or https://
   * @example
   * baseUrl = localhost
   * url = http://someurl.com/url/:id
   * request = {id: '22'}
   * output = someurl.com/url/22
   * @param {Object} - request object
   * @param {String} - original url
   * @return {String} - url with inserted request parametars
   * @memberof Communicator
   */

  var constructUrl = function constructUrl(endPointUrl, request, baseUrl) {
    var url = endPointUrl;
    var leftovers = {};

    if (endPointUrl.indexOf('http') === -1) {
      url = "".concat(baseUrl).concat(endPointUrl);
    }

    if (lodash.isObject(request)) {
      Object.keys(request).forEach(function (key) {
        if (EXCLUDED.indexOf(key) === -1) {
          var regex = new RegExp(":".concat(key));

          if (regex.test(url)) {
            url = url.replace(regex, request[key]);
          } else {
            leftovers[key] = request[key];
          }
        } else if (key === 'GET') {
          leftovers = _objectSpread2({}, leftovers, {}, request[key]);
        }
      });
    }

    url += getGetParamsAsString(leftovers);
    return url;
  };
  /**
   * @description
   * Helper function that extracts , checks and prepares body object
   * @param {Object} request - request object containing body key.
   * body can either be preparsed or as js object.
   * @returns {Object} - {body: JSON.stringify()}
   */

  var getBody = function getBody(request) {
    if (!request.body) return false;
    /* if (typeof request.body === 'string' && isObject(JSON.parse(request.body)))
      { return { body: request.body }; } */

    if (request.body instanceof FormData) return {
      body: request.body
    };
    if (typeof request.body === 'string') return {
      body: request.body
    };
    if (lodash.isObject(request.body)) return {
      body: JSON.stringify(request.body)
    };
    return false;
  };

  /* import transformers from './Transformers'; */

  var Communicator = function Communicator() {
    var _this = this;

    _classCallCheck(this, Communicator);

    this.setBaseUrl = function (url) {
      _this.baseUrl = url;
    };

    this.setPrefix = function (prefix) {
      _this.basePrefix = prefix;
    };

    this.setFetch = function (_fetch) {
      var g = global || window;
      _this.fetch = _fetch.bind(g);
    };

    this.setBaseOptions = function (options) {
      _this.baseOptions = options;
    };

    this.setDispatcher = function (dispatch) {
      _this.dispatch = dispatch.bind(_this);
    };

    this.setGetState = function (getState) {
      _this.getState = getState;
    };

    this.setFailedStatuses = function (failStatuses) {
      _this.failStatuses = failStatuses;
    };

    this.getHelpers = function () {
      return _objectSpread2({}, _this.extraHelpers, {
        deepMerge: deepMerge,
        getGetParamsAsString: getGetParamsAsString
      });
    };

    this.addHelpers = function (helpers) {
      _this.extraHelpers = helpers;
    };

    this.setEndpoints = function (endpoints) {
      Object.keys(endpoints).forEach(function (k) {
        _this.endpointCreationPool.forEach(function (ecp) {
          ecp(endpoints[k], k);
        }); // push endpoint to array of original request if needed for future reference or use


        _this.originalEndpoints[k] = endpoints[k];
      });
    };

    this.addToPrefetchPool = function (_ref, name) {
      var prefetch = _ref.prefetch;

      if (prefetch && (lodash.isFunction(prefetch) || lodash.isArray(prefetch))) {
        _this.prefetchPool[name] = prefetch;
      }
    };

    this.addAsyncPrefetchPool = function (_ref2, name) {
      var asyncPrefetch = _ref2.asyncPrefetch;

      if (asyncPrefetch && lodash.isFunction(asyncPrefetch) && !lodash.isArray(asyncPrefetch)) {
        _this.asyncPrefetchPool[name] = asyncPrefetch;
      }
    };

    this.addOnErrorPool = function (_ref3, name) {
      var onError = _ref3.onError;

      if (onError && (lodash.isFunction(onError) || lodash.isArray(onError))) {
        _this.errorPool[name] = onError;
      }
    };

    this.addOnSuccessPool = function (_ref4, name) {
      var onSuccess = _ref4.onSuccess;

      if (onSuccess && (lodash.isFunction(onSuccess) || lodash.isArray(onSuccess))) {
        _this.successPool[name] = onSuccess;
      }
    };

    this.addToPostfetchPool = function (_ref5, name) {
      var postfetch = _ref5.postfetch;

      if (postfetch && (lodash.isFunction(postfetch) || lodash.isArray(postfetch))) {
        _this.postfetchPool[name] = postfetch;
      }
    };

    this.addEndpointAsClassFunction = function (_ref6, name) {
      var url = _ref6.url,
          options = _ref6.options,
          useEmptyHeaders = _ref6.useEmptyHeaders;

      // requestParams,requestOptions can be added per request
      // and will override original params and options
      _this[name] = function () {
        var requestParams = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var requestOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var _useEmptyHeaders = arguments.length > 2 ? arguments[2] : undefined;

        return _this.baseFetch(url, options, requestParams, requestOptions, name, _useEmptyHeaders || useEmptyHeaders);
      }; // we also add this method to actions


      _this.actions[name] = _this[name];
    };

    this.runForError = function (name, _ref7) {
      var res = _ref7.res,
          message = _ref7.message;

      if (_this.onError) {
        var errFns = lodash.isArray(_this.onError) ? _this.onError : [_this.onError];
        errFns.forEach(function (errFn) {
          errFn({
            name: name,
            response: res,
            message: message
          });
        });
      }

      if (_this.errorPool[name]) {
        var _errFns = lodash.isArray(_this.errorPool[name]) ? _this.errorPool[name] : [_this.errorPool[name]];

        _errFns.forEach(function (errFn) {
          errFn({
            name: name,
            response: res,
            message: message
          });
        });
      }

      if (_this.dispatch && _this.actionError) {
        _this.dispatch(_this.actionError(name, res, message));
      }
    };

    this.runPrefetchActions = function (name, options) {
      if (_this.asyncPrefetchPool[name] && _this.getState) {
        return _this.asyncPrefetchPool[name](options).then(function (res) {
          if (res) return Promise.resolve(res);
          return Promise.resolve(options);
        });
      }

      return Promise.resolve(options);
    };

    this.baseFetch = function (url) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var requestParams = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var reqestOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var
      /* options from a singel call */
      name = arguments.length > 4 ? arguments[4] : undefined;
      var useEmptyHeaders = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

      if (!_this.fetch) {
        throw new Error('rest-fetcher-base requires fetch to be defined. Since none was found in construction you probably forgot to add one manually');
      }

      var expected = requestParams.expected || 'json';
      /* let endPointUrl; */

      var endOption = deepMerge(_this.baseOptions, options, reqestOptions
      /* we add body later */
      );
      /* clear headers if needed */

      if (useEmptyHeaders) endOption.headers = {};
      var object = {
        actions: _this.actions,
        getState: _this.getState,
        dispatch: _this.dispatch,
        params: requestParams,
        options: endOption,
        url: url,
        helpers: _this.getHelpers()
      };
      return _this.runPrefetchActions(name, object).then(function (_object) {
        var allObject = _object;

        if (_this.prefetchPool[name] && _this.getState) {
          var pf = lodash.isArray(_this.prefetchPool[name]) ? _this.prefetchPool[name] : [_this.prefetchPool[name]];
          pf.forEach(function (prefetch) {
            var res = prefetch(allObject);
            if (res) allObject = deepMerge(object, res);
          });
        }

        endOption = deepMerge(allObject.options, getBody(allObject.params));
        var endPointUrl = constructUrl(allObject.url, allObject.params, _this.baseUrl);
        /* if no dispatch return promise */

        /* if (!this.dispatch || this.dispatch === null) {
        return this.fetch(endPointUrl, endOption);
        } */

        /* dispatch action start */

        if (_this.dispatch && _this.actionStart) {
          _this.dispatch(_this.actionStart(name, endPointUrl, endOption));
        }
        /* fetch part */


        var res;
        return _this.fetch(endPointUrl, endOption).then(function (response) {
          /* this object will be passes to second .then to be included in END dispatch */
          res = {
            ok: response.ok,
            redirected: response.redirected,
            status: response.status,
            type: response.type,
            url: response.url
          };
          /* if (positiveResponseStatus.indexOf(response.status) !== -1 || response.ok) { */

          return Promise.all([response[expected](), Promise.resolve(res)]);
          /* }
          throw response; */
        }).then(function (json) {
          var pfObj = {
            actions: _this.actions,
            getState: _this.getState,
            dispatch: _this.dispatch,
            data: json[0],
            response: json[1],
            helpers: _this.getHelpers()
          };

          if (_this.failStatuses.indexOf(json[1].status) !== -1) {
            _this.runForError(name, {
              res: res,
              message: json[0]
            }); // this.dispatch(this.actionError(name, res, json[0]));

          } else {
            if (_this.successPool[name]) {
              var sc = lodash.isArray(_this.successPool[name]) ? _this.successPool[name] : [_this.successPool[name]];
              sc.forEach(function (e) {
                var rpf = e(pfObj);
                /* if object is return -> deepMerge it */

                if (rpf) pfObj = deepMerge(pfObj, rpf);
              });
            }
            /* json[0]->actual response, json[1]->res object storing some metadata */


            if (_this.dispatch && _this.actionEnd) {
              _this.dispatch(_this.actionEnd(name, json[0], json[1]));
            }
          }

          if (_this.postfetchPool[name]) {
            var _pf = lodash.isArray(_this.postfetchPool[name]) ? _this.postfetchPool[name] : [_this.postfetchPool[name]];

            _pf.forEach(function (e) {
              var rpf = e(pfObj);
              /* if object is return -> deepMerge it */

              if (rpf) pfObj = deepMerge(pfObj, rpf);
            });

            return Promise.resolve(pfObj.data);
          }

          return Promise.resolve(json[0]);
        })["catch"](function (e) {
          _this.runForError(name, {
            message: e.message,
            res: res
          });
          /* if (this.onError) {
            const errFns = isArray(this.onError)
              ? this.onError[name]
              : [this.onError[name]];
            errFns.forEach((errFn) => {
              errFn({ name, response: res, message: e.message });
            });
          }
          if (this.errorPool[name]) {
            const errFns = isArray(this.errorPool[name])
              ? this.onError[name]
              : [this.onError[name]];
            errFns.forEach((errFn) => {
              errFn({ name, response: res, message: e.message });
            });
          }
          if (this.dispatch && this.actionError) {
            this.dispatch(this.actionError(name, res, e.message));
          } */

        });
      });
    };

    // if request doesnt contain 'http' it will be concatinated with baseUrl
    this.baseUrl = ''; // we will use global fetch if exist

    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      this.fetch = fetch.bind(window);
    } else {
      this.fetch = null;
    }

    this.extraHelpers = {};
    this.originalEndpoints = {};
    this.reducerPool = {};
    this.prefetchPool = {};
    this.postfetchPool = {};
    this.transformerPool = {};
    this.asyncPrefetchPool = {};
    this.successPool = {};
    this.errorPool = {};
    this.onError = [];
    this.endpointCreationPool = [this.addToPrefetchPool, this.addToPostfetchPool, this.addEndpointAsClassFunction, this.addAsyncPrefetchPool, this.addOnErrorPool, this.addOnSuccessPool]; // actions are a collection of endpoint actions that can be exported for further use

    this.actions = {};
    this.basePrefix = 'api(.)(.)';
    this.failStatuses = [400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 500, 501, 502, 503];
    this.baseOptions = {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cache: 'no-cache',
        credentials: 'same-origin'
      }
    };
  }
  /* GETers SETers */
  ;

  var index = new Communicator();

  exports.Base = Communicator;
  exports.default = index;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.js.map
