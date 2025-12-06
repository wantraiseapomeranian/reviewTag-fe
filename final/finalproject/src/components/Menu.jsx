import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Link, useNavigate } from "react-router-dom"
import { accessTokenState, adminState, clearLoginState, loginIdState, loginLevelState, loginState } from "../utils/jotai";




export default function Menu() {
    const navigate = useNavigate();

    //통합 state
    const [loginId, setLoginId] = useAtom(loginIdState);
    const [loginLevel, setLoginLevel] = useAtom(loginLevelState);
    const [loginComplete, setLoginComplete] = useAtom(loginState); 
    const [accessToken, setAccessToken] = useAtom(accessTokenState);
    const isLogin = useAtomValue(loginState);
    const isAdmin = useAtomValue(adminState);  
    const clearLogin = useSetAtom(clearLoginState);

    return(<>
        <div className="row mt-4">
            <div className="col">
                <h1>임시 메뉴 화면</h1>
                <Link to="/"> 홈</Link> 
                <Link to="/member/login"> 로그인</Link>
                <Link to="/member/join"> 회원가입</Link>    
            </div>
        </div>
    </>)
}