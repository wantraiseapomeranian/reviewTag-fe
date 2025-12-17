import { Route, Routes } from "react-router-dom";
import Test from "./Contents/Test";
import Home from "./Home";
import MemberJoin from "./member/MemberJoin";
import SearchAndSave from "./Contents/SearchAndSave";
import MemberJoinFinish from "./member/MemberJoinFinish";
import MemberLogin from "./member/MemberLogin";
import ReviewWrite from "./review/ReviewWrite";
import ReviewUpdate from "./review/ReviewUpdate";
import ReviewUpdate2 from "./review/ReviewUpdate2";
import NeedPermission from "./error/NeedPermission";
import TargetNotfound from "./error/TargetNotfound";
import WriteReview from "./review/WriteReview";
import GenreList from "./Contents/GenreList";
import ContentsListByGenre from "./Contents/ContentsListByGenre";
import ContentsDetail from "./Contents/ContentsDetail";
import SearchContents from "./Contents/SearchContents";
import MemberMypage from "./member/MemberMypage";
import MemberMyquiz from "./member/MemberMyquiz";
import MemberMycontent from "./member/MemberMycontent";
import MemberMyfavorite from "./member/MemberMyfavorite";
import MemberMyinfo from "./member/MemberMyinfo";
import MemberMyreview from "./member/MemberMyreview";
import MemberEdit from "./member/MemberEdit";
import MemberEditPassword from "./member/MemberEditPassword";
import ReviewSearch from "./review/ReviewUpdate";
import SearchResult from "./Contents/SearchResult";
import PointMain from "./Point/PointMain";

import QuizLanding from "./quiz/QuizLanding";

import SlideContents from "./Contents/SlideContents";
import ReviewDetail from "./review/ReviewDetail";
import AdminQuizPage from "./admin/AdminQuizPage";
import AdminMain from "./admin/AdminMain";
import AdminMemberPage from "./admin/AdminMemberPage";
import AdminMemberDetail from "./admin/AdminMemberDetail";
import MyCreatedQuizDetail from "./quiz/MyCreatedQuizDetail";
import BoardInsert from "./board/BoardInsert";
import BoardList from "./board/BoardList";
import BoardContentsList from "./board/BoardContentsList";
import BoardDetail from "./board/BoardDetail";
import RankingPage from "./ranking/RankingPage";
import RankingQuizPage from "./ranking/RankingQuizPage";
import RankingReviewPage from "./ranking/RankingReviewPage";
import RankingMoviePage from "./ranking/RankingContentsPage";
import RankingNewPage from "./ranking/RankingNewPage";
import RankingContentsPage from "./ranking/RankingContentsPage";

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
                    {/* 컨텐츠 검색 후 리뷰 */}
                    <Route path="/contents/test2" element={<SearchAndSave/>}> 
                        <Route path="/contents/test2/review/:contentsId" element={<ReviewWrite/>}></Route>
                    </Route>
                    <Route path="/contents/searchTitle" element={<SearchContents/>}></Route>
                    <Route path="/contents/genreList" element={<GenreList/>}>
                        <Route path="/contents/genreList/listByGenre/:genreName" element={<ContentsListByGenre/>}></Route>
                    </Route>
                    <Route path="/contents/detail/:contentsId" element={<ContentsDetail/>}>
                        {/* 퀴즈 중첩 라우팅 */}
                        <Route path="quiz" element={<QuizLanding/>} />
                    </Route>
                    <Route path="/contents/searchResult/:query" element={<SearchResult/>}></Route>
                    <Route path="/contents/slide" element={<SlideContents/>}></Route>
                    

                    {/* 회원 페이지 */}
                    <Route path="/point/main" element={<PointMain/>}></Route>

                    {/* 게시글 페이지 */}
                    <Route path="/board/list" element={<BoardList/>}></Route>
                    <Route path="/board/List/:contentsId" element={<BoardContentsList/>}></Route>
                    <Route path="/board/insert" element={<BoardInsert/>}></Route>
                    <Route path="/board/:boardNo" element={<BoardDetail/>}></Route>
                    <Route path="/board/edit/:boardNo" element={<BoardEdit/>}></Route>


                    {/* 회원 페이지 */}
                    <Route path="/member/join" element={<MemberJoin/>}></Route>
                    <Route path="/member/joinFinish" element={<MemberJoinFinish/>}></Route>
                    <Route path="/member/login" element={<MemberLogin/>}></Route>
                    <Route path="/member/mypage/" element={<MemberMypage/>}>
                        <Route path="/member/mypage/myinfo/:loginId" element={<MemberMyinfo/>}> </Route>
                        <Route path="/member/mypage/myquiz/:loginId" element={<MemberMyquiz/>}> </Route>
                        <Route path="/member/mypage/mycontent/:loginId" element={<MemberMycontent/>}> </Route>
                        <Route path="/member/mypage/myfavorite/:loginId" element={<MemberMyfavorite/>}> </Route>
                        <Route path="/member/mypage/myreview/:loginId" element={<MemberMyreview/>}> </Route>
                        <Route path="/member/mypage/edit/:loginId" element={<MemberEdit/>}></Route>
                        <Route path="/member/mypage/password/:loginId" element={<MemberEditPassword/>}></Route>
                        <Route path="/member/mypage/quiz/detail/:quizId" element={<MyCreatedQuizDetail />} />
                    </Route>

                    {/* 리뷰 페이지 */} 
                    <Route path="/review/insert" element={<ReviewWrite/>}></Route>
                    <Route path="/review/:reviewNo" element={<ReviewUpdate/>}></Route>
                    <Route path="/review2/:reviewNo" element={<ReviewUpdate2/>}></Route>

                    {/* 보류 */}
                    <Route path="/review/search" element={<ReviewSearch/>}></Route>


                    {/* 리뷰작성 */}
                    <Route path="/review/write/:contentsId" element={<WriteReview/>}></Route>
                    <Route path="/review/:contentsId/:reviewNo" element={<ReviewDetail/>}></Route>


                    {/* 리뷰 조회 */}
                    <Route path="/contents/searchForReview" element={<SearchAndSave/>}>
                        <Route path="/contents/searchForReview/review/:contentsId" element={<ReviewWrite/>}></Route>
                    </Route>

                    {/* 랭킹 페이지 */}
                    <Route path="/ranking" element={<RankingPage/>}></Route>
                    <Route path="/ranking/quiz" element={<RankingQuizPage/>}></Route>
                    <Route path="/ranking/review" element={<RankingReviewPage/>}></Route>
                    <Route path="/ranking/contents" element={<RankingContentsPage/>}></Route>
                    <Route path="/ranking/new" element={<RankingNewPage/>}></Route>

                    {/* 에러 페이지 */}
                    <Route path="/error/403" element={<NeedPermission/>}></Route>
                    <Route path="*" element={<TargetNotfound/>}></Route>

                    {/* 관리자 페이지 */}
                    <Route path="/admin" element={<AdminMain />}>
                        <Route index element={<AdminMemberPage/>}></Route>
                        <Route path="/admin/member" element={<AdminMemberPage />} />
                        {/* <Route path="review" element={<AdminReviewPage />} /> */}
                        <Route path="/admin/member/:memberId" element={<AdminMemberDetail />} />
                        <Route path="/admin/quiz" element={<AdminQuizPage />} />
                        {/* <Route path="point" element={<AdminPointPage />} /> */}
                    </Route>
                </Routes>
            </div>
        </div>
    </>)
}