import { isObject, isEmpty } from 'lodash';
import { EXCLUDED } from './Constants';

/**
 * @description Merges 2 object recursavly, overriding values from second to first object.
 * @param {Obect} obj1 - firs object, will be overriden
 * @param {Obect} obj2 - second object
 */
const mergeTwo = (obj1, obj2) => {
  const _obj2 = obj2;
  let out = {};
  Object.keys(obj1).forEach((k) => {
    if (typeof obj1[k] === 'object' && obj1[k].constructor !== Array) {
      if (obj2[k] && typeof obj2[k] === 'object') {
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
export const deepMerge = (...args) => {
  let out = {};
  args.forEach((e) => {
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
const getGetParamsAsString = (getObj) => {
  if (isEmpty(getObj)) return '';
  let out = '?';
  Object.keys(getObj).forEach((k, i) => {
    if (typeof getObj[k] !== 'object' && typeof getObj[k] !== 'function') {
      out = `${out + (i !== 0 ? '&' : '') + k}=${getObj[k]}`;
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
export const constructUrl = (endPointUrl, request, baseUrl) => {
  let url = endPointUrl;
  let leftovers = {};
  if (endPointUrl.indexOf('http') === -1) {
    url = `${baseUrl}${endPointUrl}`;
  }
  if (isObject(request)) {
    Object.keys(request).forEach((key) => {
      if (EXCLUDED.indexOf(key) === -1) {
        const regex = new RegExp(`:${key}`);
        if (regex.test(url)) {
          url = url.replace(regex, request[key]);
        } else {
          leftovers[key] = request[key];
        }
      } else if (key === 'GET') {
        leftovers = { ...leftovers, ...request[key] };
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
export const getBody = (request) => {
  if (!request.body) return false;
  /* if (typeof request.body === 'string' && isObject(JSON.parse(request.body)))
    { return { body: request.body }; } */
  if (typeof request.body === 'string') return { body: request.body };
  if (isObject(request.body)) return { body: JSON.stringify(request.body) };
  return false;
};
