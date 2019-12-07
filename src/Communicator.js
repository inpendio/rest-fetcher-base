import { isFunction, isArray } from 'lodash';
import {
  constructUrl,
  deepMerge,
  getBody,
  getGetParamsAsString,
  // isPromise,
} from './utils';
/* import transformers from './Transformers'; */

class Communicator {
  constructor() {
    // if request doesnt contain 'http' it will be concatinated with baseUrl
    this.baseUrl = '';
    // we will use global fetch if exist
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
    this.endpointCreationPool = [
      this.addToPrefetchPool,
      this.addToPostfetchPool,
      this.addEndpointAsClassFunction,
      this.addAsyncPrefetchPool,
      this.addOnErrorPool,
      this.addOnSuccessPool,
    ];
    // actions are a collection of endpoint actions that can be exported for further use
    this.actions = {};
    this.basePrefix = 'api(.)(.)';
    this.failStatuses = [
      400,
      401,
      402,
      403,
      404,
      405,
      406,
      407,
      408,
      409,
      500,
      501,
      502,
      503,
    ];
    this.baseOptions = {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cache: 'no-cache',
        credentials: 'same-origin',
      },
    };
  }

  /* GETers SETers */
  setBaseUrl = (url) => {
    this.baseUrl = url;
  };

  setPrefix = (prefix) => {
    this.basePrefix = prefix;
  };

  setFetch = (_fetch) => {
    const g = global || window;
    this.fetch = _fetch.bind(g);
  };

  setBaseOptions = (options) => {
    this.baseOptions = options;
  };

  setDispatcher = (dispatch) => {
    this.dispatch = dispatch.bind(this);
  };

  setGetState = (getState) => {
    this.getState = getState;
  };

  setFailedStatuses = (failStatuses) => {
    this.failStatuses = failStatuses;
  };

  getHelpers = () => ({
    ...this.extraHelpers,
    deepMerge,
    getGetParamsAsString,
  });

  addHelpers = (helpers) => {
    this.extraHelpers = helpers;
  };

  /**
   * @description Function that creates functions from endpont objects.
   * It will run through all endpoints and through all endpointCreation function
   * sending endpoint and endpoint name to it.
   * By default it will set functions named as endpoint as part of this class,
   * prefetch, postfetch and transformer methods and add endpoint to a list of original endpoints.
   * @param {Object} endpoints - object from witch function will be created.
   * Keys will be the function names.
   * @memberof Communicator
   */
  setEndpoints = (endpoints) => {
    Object.keys(endpoints).forEach((k) => {
      this.endpointCreationPool.forEach((ecp) => {
        ecp(endpoints[k], k);
      });

      // push endpoint to array of original request if needed for future reference or use
      this.originalEndpoints[k] = endpoints[k];
    });
  };

  /**
   * @description Function that adds a prefetch method to prefetch pool for future use
   * @param {Object} endpoint - function will extract prefetch key from endpoint if one exists
   * @param {String} name - a name of the endpoint
   * @memberof Communicator
   */
  addToPrefetchPool = ({ prefetch }, name) => {
    if (prefetch && (isFunction(prefetch) || isArray(prefetch))) {
      this.prefetchPool[name] = prefetch;
    }
  };

  addAsyncPrefetchPool=({ asyncPrefetch }, name) => {
    if (asyncPrefetch && (isFunction(asyncPrefetch) && !isArray(asyncPrefetch))) {
      this.asyncPrefetchPool[name] = asyncPrefetch;
    }
  }

  addOnErrorPool=({ onError }, name) => {
    if (onError && (isFunction(onError) || isArray(onError))) {
      this.errorPool[name] = onError;
    }
  }

  addOnSuccessPool=({ onSuccess }, name) => {
    if (onSuccess && (isFunction(onSuccess) || isArray(onSuccess))) {
      this.successPool[name] = onSuccess;
    }
  }

  /**
   * @description Function that adds a postfetch method to postfetch pool for future use
   * @param {Object} endpoint - function will extract postfetch key from endpoint if one exists
   * @param {String} name - a name of the endpoint
   * @memberof Communicator
   */
  addToPostfetchPool = ({ postfetch }, name) => {
    if (postfetch && (isFunction(postfetch) || isArray(postfetch))) {
      this.postfetchPool[name] = postfetch;
    }
  };

  /**
   * @description Function that adds endpoint to this class as class function. Such function
   * can latter be called by myInstance.endpoint()
   * @param {Object} endpoint - function will extract postfetch key from endpoint if one exists
   * @param {String} name - a name of the endpoint
   * @memberof Communicator
   */
  addEndpointAsClassFunction = ({ url, options, useEmptyHeaders }, name) => {
    // requestParams,requestOptions can be added per request
    // and will override original params and options
    this[name] = (requestParams = {}, requestOptions = {}, _useEmptyHeaders) => this.baseFetch(
      url,
      options,
      requestParams,
      requestOptions,
      name,
      _useEmptyHeaders || useEmptyHeaders
    );
    // we also add this method to actions
    this.actions[name] = this[name];
  };

  runForError=(name, { res, message }) => {
    if (this.onError) {
      const errFns = isArray(this.onError)
        ? this.onError
        : [this.onError];
      errFns.forEach((errFn) => {
        errFn({ name, response: res, message });
      });
    }
    if (this.errorPool[name]) {
      const errFns = isArray(this.errorPool[name])
        ? this.errorPool[name]
        : [this.errorPool[name]];
      errFns.forEach((errFn) => {
        errFn({ name, response: res, message });
      });
    }
    if (this.dispatch && this.actionError) {
      this.dispatch(this.actionError(name, res, message));
    }
  }

  runPrefetchActions=(name, options) => {
    if (this.asyncPrefetchPool[name] && this.getState) {
      return this.asyncPrefetchPool[name](options).then((res) => {
        if (res) return Promise.resolve(res);
        return Promise.resolve(options);
      });
    }
    return Promise.resolve(options);
  }

  /**
   * @description This is a main fetch function. This will resolve the action and return either
   *  a Promise if no dispatch is provided or it will dispatch
   * success/ failure action to redux.
   * @param {String} url - target url. This will be modified by request object if needed
   * @param {Object} options - options of the request. Options contains data like headers, method
   * type and other data you want to include to fetch request.
   * This will be merged with baseOptions ( globals you can set at creation, options that apply to
   *  all) and param options. Param options contains aditional
   * data like body or can modifiy request overriding baseOptions and setted request options.
   * @param {Object} request - object containing request data that will modify end URL. TODO -
   * maybe move body params here...
   * @param {String} name - Name of the api action. Based on name a appropriate action will be
   * dispatched.
   * @param {Boolean} useEmptyHeaders - if true, empty headers will be sent.
   */
  baseFetch = (
    url,
    options = {} /* options from call */,
    requestParams = {} /* get, post params */,
    reqestOptions = {} /* options from a singel call */,
    name,
    useEmptyHeaders = false
  ) => {
    if (!this.fetch) {
      throw new Error(
        'rest-fetcher-base requires fetch to be defined. Since none was found in construction you probably forgot to add one manually'
      );
    }
    const expected = requestParams.expected || 'json';
    /* let endPointUrl; */
    let endOption = deepMerge(
      this.baseOptions,
      options,
      reqestOptions
      /* we add body later */
    );
    /* clear headers if needed */
    if (useEmptyHeaders) endOption.headers = {};

    const object = {
      actions: this.actions,
      getState: this.getState,
      dispatch: this.dispatch,
      params: requestParams,
      options: endOption,
      url,
      helpers: this.getHelpers(),
    };

    return this.runPrefetchActions(name, object).then(
      (_object) => {
        let allObject = _object;
        if (this.prefetchPool[name] && this.getState) {
          const pf = isArray(this.prefetchPool[name])
            ? this.prefetchPool[name]
            : [this.prefetchPool[name]];

          pf.forEach((prefetch) => {
            const res = prefetch(allObject);
            if (res)allObject = deepMerge(object, res);
          });
        }

        endOption = deepMerge(allObject.options, getBody(allObject.params));
        const endPointUrl = constructUrl(allObject.url, allObject.params, this.baseUrl);
        /* if no dispatch return promise */
        /* if (!this.dispatch || this.dispatch === null) {
      return this.fetch(endPointUrl, endOption);
    } */
        /* dispatch action start */
        if (this.dispatch && this.actionStart) {
          this.dispatch(this.actionStart(name, endPointUrl, endOption));
        }
        /* fetch part */
        let res;
        return this.fetch(endPointUrl, endOption)
          .then((response) => {
            /* this object will be passes to second .then to be included in END dispatch */
            res = {
              ok: response.ok,
              redirected: response.redirected,
              status: response.status,
              type: response.type,
              url: response.url,
            };
            /* if (positiveResponseStatus.indexOf(response.status) !== -1 || response.ok) { */
            return Promise.all([response[expected](), Promise.resolve(res)]);
            /* }
        throw response; */
          })
          .then((json) => {
            let pfObj = {
              actions: this.actions,
              getState: this.getState,
              dispatch: this.dispatch,
              data: json[0],
              response: json[1],
              helpers: this.getHelpers(),
            };
            if (this.failStatuses.indexOf(json[1].status) !== -1) {
              this.runForError(name, { res, message: json[0] });
              // this.dispatch(this.actionError(name, res, json[0]));
            } else {
              if (this.successPool[name]) {
                const sc = isArray(this.successPool[name])
                  ? this.successPool[name]
                  : [this.successPool[name]];
                sc.forEach((e) => {
                  const rpf = e(pfObj);
                  /* if object is return -> deepMerge it */
                  if (rpf) pfObj = deepMerge(pfObj, rpf);
                });
              }
              /* json[0]->actual response, json[1]->res object storing some metadata */
              if (this.dispatch && this.actionEnd) {
                this.dispatch(this.actionEnd(name, json[0], json[1]));
              }
            }
            if (this.postfetchPool[name]) {
              const pf = isArray(this.postfetchPool[name])
                ? this.postfetchPool[name]
                : [this.postfetchPool[name]];
              pf.forEach((e) => {
                const rpf = e(pfObj);
                /* if object is return -> deepMerge it */
                if (rpf) pfObj = deepMerge(pfObj, rpf);
              });
              return Promise.resolve(pfObj.data);
            }
            return Promise.resolve(json[0]);
          })
          .catch((e) => {
            this.runForError(name, { message: e.message, res });
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
      }
    );
  };
}

export default Communicator;
