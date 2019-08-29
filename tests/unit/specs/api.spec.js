import MockAdapter from 'axios-mock-adapter';
import Api from '@/index';


const FETCH_METHODS = ['delete', 'get', 'head', 'options'];
const SEND_METHODS = ['patch', 'post', 'put'];

const DATA = {
    question: 'The Ultimate Question of Life, the Universe, and Everything',
};
const RESPONSE = {
    status: 'OK',
    payload: {
        answer: 42,
    },
};


describe('API', () => {
    it('should create instance', () => {
        let instance;

        expect(() => {
            instance = new Api();
        }).not.toThrow();

        expect(instance instanceof Api).toBeTruthy();
    });

    it('should create separate instances of Axios for two instanes of API', () => {
        const instance1 = new Api();
        const instance2 = new Api();

        expect(instance1._axios !== instance2._axios).toBeTruthy();
    });

    it('should setup request interceptors', done => {
        const interceptor = jest.fn(config => config);
        const requestInterceptor = jest.fn(config => config);
        const errorInterceptor = jest.fn();

        const instance = new Api({
            interceptors: {
                request: [
                    interceptor,
                    [requestInterceptor, errorInterceptor],
                ],
            },
        });

        const mock = new MockAdapter(instance._axios);
        mock.onGet('/').reply(200, RESPONSE);

        instance._axios.get('/');

        // wait microtask will be executed
        // @see https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
        setTimeout(() => {
            expect(interceptor).toHaveBeenCalled();
            expect(requestInterceptor).toHaveBeenCalled();
            expect(errorInterceptor).not.toHaveBeenCalled();
            done();
        }, 1);
    });

    it('should setup response interceptors', done => {
        const interceptor = jest.fn(response => response);
        const responseInterceptor = jest.fn(response => response);
        const errorInterceptor = jest.fn();

        const instance = new Api({
            interceptors: {
                response: [
                    interceptor,
                    [responseInterceptor, errorInterceptor],
                ],
            },
        });

        const mock = new MockAdapter(instance._axios);
        mock.onGet('/').reply(500, {});

        instance._axios.get('/');

        // wait microtask will be executed
        setTimeout(() => {
            expect(interceptor).not.toHaveBeenCalled();
            expect(responseInterceptor).not.toHaveBeenCalled();
            expect(errorInterceptor).toHaveBeenCalled();
            done();
        }, 1);
    });

    describe('should has the same API as Axios', () => {
        const instance = new Api();

        it.each(
            FETCH_METHODS.concat(SEND_METHODS)
        )('should has `%s` method', method => {
            expect(typeof instance[method]).toBe('function');
        });
    })
});

describe('`Request` method', () => {
    it('should do request to backend', () => {
        const instance = new Api();

        const mock = new MockAdapter(instance._axios);
        mock.onGet('/').reply(200, RESPONSE);

        expect(instance.request({
            method: 'GET',
            url: '/',
        })).resolves.toMatchSnapshot();
    });

    it('should setup common error handler if one is defined', done => {
        const commonErrorHandler = jest.fn();
        const noopErrorHandler = jest.fn();

        const instance = new Api({
            commonErrorHandler,
        });

        const mock = new MockAdapter(instance._axios);
        mock.onGet('/').reply(500, {});

        instance.request({
            method: 'GET',
            url: '/'
        }).then(
            () => {},
            noopErrorHandler
        );

        // wait microtask will be executed
        setTimeout(() => {
            expect(commonErrorHandler).toHaveBeenCalled();
            expect(noopErrorHandler).toHaveBeenCalled();
            done();
        }, 1);
    });

    it('should not setup common error handler if one is switched off in config', done => {
        const commonErrorHandler = jest.fn();
        const noopErrorHandler = jest.fn();

        const instance = new Api({
            commonErrorHandler,
        });

        const mock = new MockAdapter(instance._axios);
        mock.onGet('/').reply(500, {});

        instance.request({
            method: 'GET',
            url: '/',
            useCommonErrorHandler: false,
        }).then(
            () => {},
            noopErrorHandler
        );

        // wait microtask will be executed
        setTimeout(() => {
            expect(commonErrorHandler).not.toHaveBeenCalled();
            expect(noopErrorHandler).toHaveBeenCalled();
            done();
        }, 1);
    });
});

describe('Helpers methods', () => {
    it.each(FETCH_METHODS)('`%s` method should pass correct config to `request` method', method => {
        const requestMock = jest.fn();

        const instance = new Api();
        instance.request = requestMock;

        const mock = new MockAdapter(instance._axios);
        mock.onGet('/').reply(200, RESPONSE);

        // setup method params
        const params = ['/', {
            timeout: 300,  // axios request config
        }];

        // send request
        instance[method].apply(instance, params);

        expect(requestMock).toHaveBeenCalled();
        expect(requestMock.mock.calls[0][0]).toEqual({
            method,
            url: '/',
            timeout: 300,
        });
    });

    it.each(SEND_METHODS)('`%s` method should pass correct config to `request` method', method => {
        const requestMock = jest.fn();

        const instance = new Api();
        instance.request = requestMock;

        const mock = new MockAdapter(instance._axios);
        mock.onGet('/').reply(200, RESPONSE);

        // setup method params
        const params = ['/', DATA, {
            timeout: 300,  // axios request config
        }];

        // send request
        instance[method].apply(instance, params);

        expect(requestMock).toHaveBeenCalled();
        expect(requestMock.mock.calls[0][0]).toEqual({
            method,
            url: '/',
            data: DATA,
            timeout: 300,
        });
    });
});
