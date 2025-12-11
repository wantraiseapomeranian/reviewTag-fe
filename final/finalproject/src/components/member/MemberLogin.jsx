import axios from "axios";
import { useCallback } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {useAtom} from "jotai";
import { accessTokenState, loginIdState, loginLevelState, loginNicknameState, refreshTokenState } from "../../utils/jotai";
import "./Member.css";
export default function MemberLogin(){
    //통합 state
    const [loginId , setLoginId] = useAtom(loginIdState);
    const [loginLevel , setLoginLevel] = useAtom(loginLevelState);
    const [loginNickname, setLoginNickname] = useAtom(loginNicknameState);
    const [accessToken , setAccessToken] = useAtom(accessTokenState);
    const [refreshToken , setRefreshToken] = useAtom(refreshTokenState);
    // 도구
    const navigate = useNavigate();
    //state
    const [loginResult, setLoginResult] = useState(null);

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
            console.log(data);
            //통합 state 저장
            setLoginId(data.loginId);
            setLoginLevel(data.loginLevel);
            setLoginNickname(data.loginNickname);
            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);
            // state저장
            setLogin(true);
            setLoginResult(true)
            console.log("로그인 성공");
            // 화면이동
            navigate("/");
        }
        catch(err){
            setLogin(false);
            setLoginResult(false);
            console.log("로그인 실패");
        }
    },[member])


    //render
    return(<>
    <div className="container">
        <div className="row">
        <div className="member-form col-sm-8 offset-2">
        <div className="row">
            <div className="col">
                <h1 className="text-center">로그인</h1>
            </div>
        </div>
        <hr/>
        <div className="row mt-4">
            <div className="col-md-1"></div>
            <label className="col-md-3 col-sm-3 col-form-label">ID</label>
            <div className="col-sm-7">
                <input type="text" className="form-control" name="memberId" value={member.memberId}
                    onChange={changeStrValue}/>
            </div>
        </div>
        <div className="row mt-3">
            <div className="col-md-1"></div>
            <label className="col-md-3 col-sm-3 col-form-label">비밀번호</label>
            <div className="col-sm-7">
                <input type="password" className="form-control" name="memberPw" value={member.memberPw}
                    onChange={changeStrValue}/>
            </div>
        </div>



        <div className="row mt-2">
             <div className="col-md-4 col-sm-3"></div>
            <div className="col-sm-7">
                {loginResult === false && (
                    <div className="row">
                        <div className="col fs-6 text-center text-danger">
                            아이디 또는 비밀번호가 잘못되었습니다
                        </div>
                    </div>
                )}
                <button type="button" className="mt-2 btn btn-success w-100 btn-lg"
                        onClick={sendLogin}> 로그인
                </button>
            </div>
        </div>
</div>
</div>
</div>
    </>)
}