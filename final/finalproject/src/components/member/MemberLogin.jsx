import axios from "axios";
import { useCallback } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {useAtom} from "jotai";
import { accessTokenState, loginIdState, loginLevelState, refreshTokenState } from "../../utils/jotai";

export default function MemberLogin(){
    //통합 state
    const [loginId , setLoginId] = useAtom(loginIdState);
    const [loginLevel , setLoginLevel] = useAtom(loginLevelState);
    const [accessToken , setAccessToken] = useAtom(accessTokenState);
    const [refreshToken , setRefreshToken] = useAtom(refreshTokenState);
    // 도구
    const navigate = useNavigate();
    //state
    const [member, setMember] = useState({
        memberId : "", memberPw : ""
    })

    //callback
    const changeStrValue = useCallback(e=>{
        const {name, value} = e.target;
        setMember(prev =>({...prev, [name] : value}));
    },[])

    const [login, setLogin] = useState(null); // null 시도x -> true or false
    const sendLogin = useCallback(async()=>{
        try{
            //로그인 시도
            const {data} = await axios.post("/member/login", member);

            // Authorization에 accesstoken 저장
            axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
            
            //통합 state 저장
            setLoginId(data.loginId);
            setLoginLevel(data.loginLevel);
            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);
            // 화면이동
            setLogin(true);
            console.log("로그인 성공");
            navigate("/");
        }
        catch(err){
            console.log(err);
            setLogin(false);
            console.log("로그인 실패");
        }
    },[member])


    //render
    return(<>
        <div className="row mt-4">
            <div className="col">
                <h1>로그인</h1>
            </div>
        </div>
        
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">ID</label>
            <div className="col-sm-9">
                <input type="text" className="form-control" name="memberId" value={member.memberId}
                    onChange={changeStrValue}/>
            </div>
        </div>
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">비밀번호</label>
            <div className="col-sm-9">
                <input type="password" className="form-control" name="memberPw" value={member.memberPw}
                    onChange={changeStrValue}/>
            </div>
        </div>

        <div className="row mt-4">
            <div className="col">
                <button type="button" className="btn btn-success w-100 btn-lg"
                        onClick={sendLogin}
                        > 로그인
                </button>
            </div>
        </div>
    </>)
}