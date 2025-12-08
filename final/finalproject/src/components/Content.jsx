import { Route, Routes } from "react-router-dom";
import Test from "./Contents/Test";
import Home from "./Home";
import MemberJoin from "./member/MemberJoin";
import SearchAndSave from "./Contents/SearchAndSave";

import MemberJoinFinish from "./member/MemberJoinFinish";
import MemberLogin from "./member/MemberLogin";

import ReviewWrite from "./review/ReviewWrite";
import ReviewSearch from "./review/ReviewSearch";

export default function Content() {
    return (<>

        {/* 전체 화면의 폭을 통제하기 위한 추가 코드 */}
        <div className="row">
            <div className="col-md-10 offset-md-1">

                {/* 분할된 화면의 주소를 지정하는 영역 (path=주소 , element=화면) */}
                <Routes>
                    {/* 메인 페이지 */}
                    <Route path="/" element={<Home/>}></Route>
                    

                    {/* contents */}
                    <Route path="/contents/test" element={<Test/>}></Route>
                    <Route path="/contents/test2" element={<SearchAndSave/>}>
                        <Route path="/contents/test2/review" element={<ReviewWrite/>}></Route>
                    </Route>

                   {/* 회원 페이지 */}
                        <Route path="/member/join" element={<MemberJoin/>}></Route>
                        <Route path="/member/joinFinish" element={<MemberJoinFinish/>}></Route>
                        <Route path="/member/login" element={<MemberLogin/>}></Route>

                    {/* 리뷰 페이지 */}
                        <Route path="/review/search" element={<ReviewSearch/>}></Route>
                </Routes>
            </div>
        </div>
    </>)
}