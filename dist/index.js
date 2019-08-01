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

    this.getHelpers = function () {
      return {
        deepMerge: deepMerge
      };
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

    this.addToPostfetchPool = function (_ref2, name) {
      var postfetch = _ref2.postfetch;

      if (postfetch && (lodash.isFunction(postfetch) || lodash.isArray(postfetch))) {
        _this.postfetchPool[name] = postfetch;
      }
    };

    this.addEndpointAsClassFunction = function (_ref3, name) {
      var url = _ref3.url,
          options = _ref3.options,
          useEmptyHeaders = _ref3.useEmptyHeaders;

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

      if (useEmptyHeaders) endOption = {
        headers: {}
      };
      var object = {
        actions: _this.actions,
        getState: _this.getState,
        dispatch: _this.dispatch,
        params: requestParams,
        options: endOption,
        url: url,
        helpers: _this.getHelpers()
      };

      if (_this.prefetchPool[name] && _this.getState) {
        /* we need this to be an array... */
        var pf = lodash.isArray(_this.prefetchPool[name]) ? _this.prefetchPool[name] : [_this.prefetchPool[name]];
        /* you can either change object directly or return {params, options} */

        pf.forEach(function (e) {
          var res = e(object);
          if (res) object = deepMerge(object, res);
        });
      }

      endOption = deepMerge(object.options, getBody(object.params));
      var endPointUrl = constructUrl(object.url, object.params, _this.baseUrl);
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
        /* json[0]->actual response, json[1]->res object storing some metadata */
        if (_this.dispatch && _this.actionEnd) {
          _this.dispatch(_this.actionEnd(name, json[0], json[1]));
        }

        if (_this.postfetchPool[name]) {
          var pfObj = {
            actions: _this.actions,
            getState: _this.getState,
            dispatch: _this.dispatch,
            data: json[0],
            helpers: _this.getHelpers()
          };

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
        if (_this.dispatch && _this.actionError) {
          _this.dispatch(_this.actionError(name, res, e.message));
        }
      });
    };

    // if request doesnt contain 'http' it will be concatinated with baseUrl
    this.baseUrl = ''; // we will use global fetch if exist

    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      this.fetch = fetch.bind(window);
    } else {
      this.fetch = null;
    }

    this.originalEndpoints = {};
    this.reducerPool = {};
    this.prefetchPool = {};
    this.postfetchPool = {};
    this.transformerPool = {};
    this.endpointCreationPool = [this.addToPrefetchPool, this.addToPostfetchPool, this.addEndpointAsClassFunction]; // actions are a collection of endpoint actions that can be exported for further use

    this.actions = {};
    this.basePrefix = 'api(.)(.)';
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
