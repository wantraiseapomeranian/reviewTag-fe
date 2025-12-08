import { Route, Routes } from "react-router-dom";
import Test from "./Contents/Test";
import Home from "./Home";
import MemberJoin from "./member/MemberJoin";
import SearchAndSave from "./Contents/SearchAndSave";
import MemberJoinFinish from "./member/MemberJoinFinish";
import MemberLogin from "./member/MemberLogin";
import ReviewWrite from "./review/ReviewWrite";
import ReviewUpdate from "./review/ReviewUpdate";
import NeedPermission from "./error/NeedPermission";
import TargetNotfound from "./error/TargetNotfound";
import WriteReview from "./review/WriteReview";

import GenreList from "./Contents/GenreList";
import ContentsListByGenre from "./Contents/ContentsListByGenre";
import ContentsDetail from "./Contents/ContentsDetail";
import SearchContents from "./Contents/SearchContents";
import MemberMypage from "./member/MemberMypage";
import MemberMyquiz from "./member/MemberMyquiz";
import MemberMymovie from "./member/MemberMymovie";
import MemberMyinfo from "./member/MemberMyinfo";
import MemberMyreview from "./member/MemberMyreview";
import MemberEdit from "./member/MemberEdit";
import MemberEditPassword from "./member/MemberEditPassword";
import ReviewSearch from "./review/ReviewUpdate";



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
                        <Route path="/contents/test2/review/:contentsId" element={<ReviewWrite/>}></Route>
                    </Route>

                    <Route path="/contents/searchTitle" element={<SearchContents/>}></Route>
                    <Route path="/contents/genreList" element={<GenreList/>}></Route>
                    <Route path="/contents/listByGenre/:genreName" element={<ContentsListByGenre/>}></Route>
                    <Route path="/contents/detail/:contentsId" element={<ContentsDetail/>}></Route>

                    {/* 회원 페이지 */}
                    <Route path="/member/join" element={<MemberJoin/>}></Route>
                    <Route path="/member/joinFinish" element={<MemberJoinFinish/>}></Route>
                    <Route path="/member/login" element={<MemberLogin/>}></Route>
                    <Route path="/member/edit/:loginId" element={<MemberEdit/>}></Route>
                    <Route path="/member/password/:loginId" element={<MemberEditPassword/>}></Route>
                    <Route path="/member/mypage/" element={<MemberMypage/>}>
                        <Route path="/member/mypage/myinfo/:loginId" element={<MemberMyinfo/>}> </Route>
                        <Route path="/member/mypage/myquiz/:loginId" element={<MemberMyquiz/>}> </Route>
                        <Route path="/member/mypage/mymovie/:loginId" element={<MemberMymovie/>}> </Route>
                        <Route path="/member/mypage/myreview/:loginId" element={<MemberMyreview/>}> </Route>
                    </Route>

                    {/* 리뷰 페이지 */} 
                    <Route path="/review/insert" element={<ReviewWrite/>}></Route>
                    <Route path="/review/:reviewNo" element={<ReviewUpdate/>}></Route>

                    <Route path="/review/search" element={<ReviewSearch/>}></Route>
                    <Route path="/review/write/:contentsId" element={<WriteReview/>}></Route>

                    
                    <Route path="/contents/searchForReview" element={<SearchAndSave/>}>
                        <Route path="/contents/searchForReview/review/:contentsId" element={<ReviewWrite/>}></Route>
                    </Route>


                    {/* 에러 페이지 */}
                        <Route path="/error/403" element={<NeedPermission/>}></Route>
                        <Route path="*" element={<TargetNotfound/>}></Route>
                </Routes>
            </div>
        </div>
    </>)
}