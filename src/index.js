import axios from 'axios';


/**
 * @typedef {function(request: AxiosRequestConfig): AxiosRequestConfig} AxiosRequestInterceptor
 */

/**
 * @typedef {function(response: AxiosResponse): AxiosResponse} AxiosResponseInterceptor
 */

/**
 * @typedef {function(error: AxiosError): *} AxiosErrorInterceptor
 */

/**
 * @typedef {Object} Config
 * @extends {AxiosRequestConfig}
 *
 * @property {function(error: AxiosError): *} [commonErrorHandler]
 * @property {Object} [interceptors]
 * @property {Array<AxiosRequestInterceptor|[AxiosRequestInterceptor, AxiosErrorInterceptor]>} interceptors.request
 * @property {Array<AxiosResponseInterceptor|[AxiosResponseInterceptor, AxiosErrorInterceptor]>} interceptors.response
 */

/**
 * @typedef {Object} RequestConfig
 * @extends {AxiosRequestConfig}
 *
 * @property {boolean} [useCommonErrorHandler=true]
 */


/**
 * Constructs axios facade
 *
 * @constructor
 * @param {Config} [config={}]
 */
export default function Api(config = {}) {
    const {
        interceptors = {},
        commonErrorHandler = null,
    } = config;

    this._axios = axios.create(config);
    this._commonErrorHandler = commonErrorHandler;

    // setup interceptors for axios instance
    ['request', 'response'].forEach(type => {
        if (Array.isArray(interceptors[type])) {
            interceptors[type].forEach(handlers => {
                if (typeof handlers === 'function') {
                    this._axios.interceptors[type].use(handlers);
                } else {
                    this._axios.interceptors[type].use(/* fulfilled */ handlers[0], /* rejected */ handlers[1]);
                }
            });
        }
    });
}

/**
 * Does network request
 *
 * Before all, read article. You should understand what is promise chaining
 * @see https://medium.com/javascript-scene/master-the-javascript-interview-what-is-a-promise-27fc71e77261
 *
 * Main goal of facade is using common error handler `commonErrorHandler`.
 *
 * @this Api
 * @param {RequestConfig} config
 * @return {Promise}
 */
Api.prototype.request = function requestHandler(config) {
    const {
        useCommonErrorHandler = true,
    } = config;

    const request = this._axios.request(config);

    if (useCommonErrorHandler && this._commonErrorHandler !== null) {
        // create first branch of promise chaining
        request.catch(this._commonErrorHandler);
    }

    return request;
};


/* Provide aliases for supported request methods
 */

['delete', 'get', 'head', 'options'].forEach(method => {
    /**
     * Fetch data
     *
     * @this Api
     * @param {string} url
     * @param {RequestConfig} [config]
     * @return {Promise}
     */
    Api.prototype[method] = function fetchHandler(url, config) {
        return this.request(Object.assign({}, config, {
            method,
            url,
        }));
    }
});

['patch', 'post', 'put'].forEach(method => {
    /**
     * Sends data
     *
     * @this Api
     * @param {string} url
     * @param {*} [data]
     * @param {RequestConfig} [config]
     * @return {Promise}
     */
    Api.prototype[method] = function sendHandler(url, data, config) {
        return this.request(Object.assign({}, config, {
            method,
            url,
            data,
        }));
    };
});
