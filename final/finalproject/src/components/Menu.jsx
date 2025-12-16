import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Link, useNavigate } from "react-router-dom"
import { accessTokenState, adminState, clearLoginState, heartState, loginCompleteState, loginIdState, loginLevelState, loginState } from "../utils/jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import './Menu.css'
import { MdMovie } from "react-icons/md";
import { FaHeart, FaGear } from "react-icons/fa6";


export default function Menu() {
    const navigate = useNavigate();

    //통합 state
    const [loginId, setLoginId] = useAtom(loginIdState);
    const [loginLevel, setLoginLevel] = useAtom(loginLevelState);
    const [loginComplete, setLoginComplete] = useAtom(loginCompleteState); 
    const [accessToken, setAccessToken] = useAtom(accessTokenState);
    const isLogin = useAtomValue(loginState);
    const isAdmin = useAtomValue(adminState);  
    const clearLogin = useSetAtom(clearLoginState);

    //하트 가져오기
    const [heart, setHeart] = useAtom(heartState);

    //effect
    useEffect(()=>{
        if(accessToken?.length>0){
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        }
        setLoginComplete(true);
    },[accessToken]);

    //로그인 성공 시, 내 정보 불러오기
    useEffect(() => {
        if (isLogin && loginId) {
            loadMemberData();
        }
    }, [isLogin, loginId]);

    //callback
    //내 정보 가져오는 함수
    const loadMemberData = useCallback(async ()=> {

        //비로그인일때는 불러오지 않음
        if(!loginId || !accessToken) return;

        //보유중인 하트 개수 불러오기
        try {
        const { data } = await axios.get(`/heart/`);

        if(data.heartCount !== undefined){
            setHeart(data.heartCount);
            } else {
                setHeart(5);
            }
        } catch (error) {
            console.error("내 정보 불러오기 실패:", error);
        }
    }, [loginId, accessToken, setHeart]);

    //로그아웃
    const logout = useCallback(async(e)=>{
        e.stopPropagation();
        e.preventDefault();
        clearLogin();
        await axios.delete("/member/logout");
        delete axios.defaults.headers.common['Authorization'];
        navigate("/");

        closeMenu();
    },[]);

    //메뉴가 정상적으로 닫히지 않는 현상에 대한 해결 (좁은 폭인 경우)
    const [open, setOpen] = useState(false);
    const toggleMenu = useCallback(()=>{ setOpen(prev=>!prev); }, []);

    //메뉴 및 외부 영역 클릭 시 메뉴가 닫히도록 처리하는 코드
    const closeMenu = useCallback(()=>{ 
        setOpen(false); 
    }, []);
    const menuRef = useRef();
    useEffect(()=>{
        //클릭 감지 함수
        const listener = e=>{
            if(open === true && menuRef.current.contains(e.target) === false) {
                closeMenu();
            }
        };
        window.addEventListener("mousedown", listener);
        return ()=>{//clean up 함수
            window.removeEventListener("mousedown", listener);
        };
    }, [open]);


return(<>

    <nav className="navbar navbar-expand-lg  text-light cinema-navbar fixed-top" data-be-theme="dark"
        ref={menuRef}>
        <div className="container-fluid">
            
            {/* 브랜딩 텍스트(이미지) : 메뉴 가장 좌측에 나오는 로고 또는 텍스트 */}
            <Link className="navbar-brand cinema-brand text-light" to="/" onClick={closeMenu}>로고 위치</Link>
        
            {/* 토글버튼 */}
            <button className="navbar-toggler " type="button" 
                    aria-controls="menu-body"  aria-expanded="false" aria-label="Toggle navigation"
                    onClick={toggleMenu}>
                <span className="navbar-toggler-icon"></span>
            </button>

            <div className={`collapse navbar-collapse ${open && 'show'}`} id="menu-body">
                {/* 좌측 메뉴 (화면이 좁아지면 합쳐짐) */}
                <ul className="navbar-nav me-auto">
                    {/* home */}
                    <li className="nav-item" onClick={closeMenu}>
                        <Link className="nav-link"  to="/">
                            <span>홈</span>
                        </Link>
                    </li>
                    {/* contents */}
                    <li className="nav-item" onClick={closeMenu}>    
                        <Link className="nav-link"  to="/contents/genreList"><span className="fs-5"><MdMovie className="mb-2" /></span></Link>
                    </li>
                    {/* 리뷰 메뉴사용x
                    <li className="nav-item dropdown ">
                        <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button"
                            aria-haspopup="true" aria-expanded="false"><span>리뷰</span></a>
                        <div className="dropdown-menu">
                            <Link className="nav-link"  to="/contents/searchForReview"><span>제목검색</span> </Link>
                            <Link className="nav-link"  to="/review/insert"><span>리뷰등록</span> </Link>
                            <Link className="nav-link"  to="/review/search"><span>리뷰검색</span></Link>
                        </div>
                    </li> */}
                    <li className="nav-item" onClick={closeMenu}>
                        <Link className="nav-link"  to="/board/list">
                            <span>게시판</span>
                        </Link>
                    </li>    
                    {/* 퀴즈(영화 상세 페이지에 구현)
                     <li className="nav-item" onClick={closeMenu}>
                        <Link className="nav-link"  to="#">
                            <span>퀴즈</span>
                        </Link>
                    </li> */}
                       <li className="nav-item" onClick={closeMenu}>
                        <Link className="nav-link"  to="/point/main">
                            <span>포인트</span>
                        </Link>
                    </li>          
                </ul>
                 <ul className="navbar-nav ms-auto">
                {/* 우측 메뉴 (화면이 좁아지면 합쳐짐) */}
                    {isAdmin === true ? (
                        <li className="nav-item" onClick={closeMenu}>
                        <Link className="nav-link" to={`/admin`}>
                            <span><FaGear /></span>
                        </Link>
                    </li>
                    ) : (
                        <>
                        </>
                    )}

                    {isLogin === true ? (<>  {/* 로그인 시 나와야 하는 화면 */}

                    {/* 하트 표시 */}
                    {!isAdmin && (
                        <li className="nav-item">
                            <div className="nav-link text-warning" style={{cursor: 'default'}}>
                                <FaHeart className="text-danger me-2" />
                                <span className="fw-bold text-light">{heart} / 5</span>
                            </div>
                        </li>
                    )}

                    <li className="nav-item">
                        <Link className="nav-link" to={`/member/mypage/myinfo/${loginId}`} onClick={closeMenu}>
                            <span>MY</span>
                        </Link>
                    </li>
                    <li className="nav-item" onClick={closeMenu}>
                        <Link className="nav-link" onClick={logout}>
                            <span>로그아웃</span>
                        </Link>
                    </li>
                    </>) : (<>  {/* 비로그인 시 나와야 하는 화면 */}
                    <li className="nav-item" onClick={closeMenu}>
                        <Link className="nav-link" to="/member/login">
                            <span>로그인</span>
                        </Link>
                    </li>
                    <li className="nav-item" onClick={closeMenu}>
                        <Link className="nav-link" to="/member/join">
                            <span>회원가입</span>
                        </Link>
                    </li>
                </>)}
                </ul>
            </div>
        </div>
    </nav>
</>)
}