import axios from "axios";

const BASE_URL: string = "";
const instance = axios.create({
    baseURL: BASE_URL,
});

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export { instance as axios };
