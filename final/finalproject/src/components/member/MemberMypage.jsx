import { useAtom } from "jotai"
import { loginIdState, loginLevelState } from "../../utils/jotai"
import "./MemberMypage.css";
import { Link, Outlet } from "react-router-dom";


export default function MemberMypage(){
    //통합 state
    const [loginid, setLoginId] = useAtom(loginIdState);
    const [loginLevel, setLoginLevel] = useAtom(loginLevelState);



    return(<>
<div className="row mt-4">
    <div className="col d-flex justify-content-center flex-wrap">
        <Link to="/member/mypage/myinfo" className="btn btn-secondary me-2 mt-2">내 정보</Link>
        <Link to="/member/mypage/mymovie" className="btn btn-secondary me-2 mt-2">내 영화</Link>
        <Link to="/member/mypage/myquiz" className="btn btn-secondary me-2 mt-2">내 퀴즈</Link>
        <Link to="/member/mypage/myreview" className="btn btn-secondary me-2 mt-2">내 리뷰</Link>
    </div>
</div>

     
                {/* 중첩 라우팅이 되어있기때문에 해당 영역을 표시할 수 있도록 <Outlet/>을 생성해야함 */}
        <div className="row mt-4">
            <div className="col">
                <Outlet/>
            </div>
        </div>
    </>)
}