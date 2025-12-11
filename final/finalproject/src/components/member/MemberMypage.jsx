import { useAtom } from "jotai"
import { loginIdState, loginLevelState } from "../../utils/jotai"
import "./Member.css";
import { Link, Outlet, useParams } from "react-router-dom";


export default function MemberMypage(){
    //통합 state
    const [loginId, setLoginId] = useAtom(loginIdState);
    const [loginLevel, setLoginLevel] = useAtom(loginLevelState);



return(<>
<div className="row">
    
<div className="col-lg-10 offset-lg-1 member-form">
    <div className="row">
        <div className="col d-flex justify-content-center flex-wrap">
            <Link to={`/member/mypage/myinfo/${loginId}`} className="btn btn-secondary me-2 mt-2">내 정보</Link>
            <Link to={`/member/mypage/mycontent/${loginId}`} className="btn btn-secondary me-2 mt-2">찜목록</Link>
            <Link to={`/member/mypage/myfavorite/${loginId}`} className="btn btn-secondary me-2 mt-2">인생작</Link>
            <Link to={`/member/mypage/myquiz/${loginId}`} className="btn btn-secondary me-2 mt-2">내 퀴즈</Link>
            <Link to={`/member/mypage/myreview/${loginId}`} className="btn btn-secondary me-2 mt-2">내 리뷰</Link>
        </div>
    </div>

    {/* 중첩 라우팅이 되어있기때문에 해당 영역을 표시할 수 있도록 <Outlet/>을 생성해야함 */}
    <div className="row mt-4">
        <div className="col">
            <Outlet/>
        </div>
    </div>
 </div>
</div>
</>)
}