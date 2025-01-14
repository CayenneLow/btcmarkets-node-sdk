import { HttpMethods } from '../constants/HttpMethods';
import { API_VERSION, SOCKET_SIGN_METHOD } from '../constants';

let CryptoJS = require('crypto-js');

export const buildAuthHeaders = (method: HttpMethods, path: string, data: any, key: string, secret: string) => {
    const now = new Date().getTime();

    const message = generateMessage(method, path, data, now);

    const signature = signMessage(secret, message);
    const headers = {
        'BM-AUTH-APIKEY': key,
        'BM-AUTH-SIGNATURE': signature,
        'BM-AUTH-TIMESTAMP': now,
    };
    return headers;
};

export const buildSocketHeaders = (key: string, secret: string) => {
    const now = new Date().getTime();
    const message = generateSocketMessage(now);
    const signature = signMessage(secret, message);
    return {
        timestamp: now,
        key: key,
        signature: signature,
    };
};

export const generateMessage = (method: HttpMethods, path: string, data: any, timespan: number) => {
    let message = method + `${API_VERSION}${path}` + timespan;
    if (data) {
        if (typeof data !== 'string') data = JSON.stringify(data);

        message += data;
    }
    return message;
};

export const generateSocketMessage = (timespan: number): string => {
    return SOCKET_SIGN_METHOD + '\n' + timespan;
};

export const signMessage = (secret: string, message: string) => {
    const secret_buffer = CryptoJS.enc.Base64.parse(secret);
    const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA512, secret_buffer);
    const signature = hmac
        .update(message)
        .finalize()
        .toString(CryptoJS.enc.Base64);
    return signature;
};
