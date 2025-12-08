import axios  from "axios";
import { accessTokenState, refreshTokenState } from "../jotai";

//axios setting
axios.defaults.baseURL = "http://localhost:8080";//앞으로 모든 통신에 이 주소를 접두사로 추가
axios.defaults.timeout = 10000;//10000ms초가 넘어가면 통신 취소(상황에 따라 조절)

//axios interceptor
axios.interceptors.request.use((config)=>{ //config는 axios 설정
    config.headers["Fronted-Url"] = window.location.href;
    return config;
});
