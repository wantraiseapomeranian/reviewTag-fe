import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate, NavLink } from "react-router-dom";
import { useAtom, useSetAtom } from "jotai";
import axios from "axios";
import { clearLoginState, loginNicknameState } from "../../utils/jotai";
import "./MemberCustom.css"; 
import { FaFish } from "react-icons/fa6";

export default function MemberMyinfo() {
    const { loginId } = useParams();
    const navigate = useNavigate();


    // 전역 상태
    const [loginNickname, setLoginNickname] = useAtom(loginNicknameState);
    const clearLogin = useSetAtom(clearLoginState);

    // 로컬 상태 (데이터 통합)
    const [data, setData] = useState(null);

    // 1. 데이터 로드 로직
    const loadData = useCallback(async () => {
        if (!loginId) return;
        try {
            const res = await axios.get(`/member/mypage/${loginId}`);
            setData(res.data);
            // 닉네임이 변경되었을 수 있으므로 전역 상태 동기화
            if (res.data.member?.memberNickname) {
                setLoginNickname(res.data.member.memberNickname);
            }
        } catch (err) {
            console.error("데이터 로딩 실패", err);
        }
    }, [loginId, setLoginNickname]);

    useEffect(() => {
        loadData();
        console.log(reliabilityInfo);
    }, [loadData]);

    // 2. 회원 탈퇴 로직
    const deleteMember = useCallback(async () => {
        if (!window.confirm("⚠️ 경고: 탈퇴 시 모든 신뢰도와 포인트가 사라집니다. 계속하시겠습니까?")) return;
        try {
            await axios.delete(`/member/${loginId}`);
            alert("탈퇴 처리가 완료되었습니다.");
            clearLogin(); // 전역 상태 초기화
            navigate("/");
        } catch (err) {
            alert("처리 중 오류 발생");
        }
    }, [loginId, navigate, clearLogin]);

    // 3. 신뢰도 배지 및 상태 계산 (useMemo)
    const reliabilityInfo = useMemo(() => {
        if (!data?.member) return { score: 0, status: "danger", badge: null };
        
        const rel = data.member.memberReliability || 0;
        const status = rel <= 49 ? "danger" : "safe";
        
        let badge = null;
        if (rel >= 50) badge = { text: "🔷 검증된 리뷰어", class: "rel-high" };
        else if (rel >= 20) badge = { text: "🔵 신뢰 리뷰어", class: "rel-mid" };
        else if (rel >= 6) badge = { text: "🟢 활동 리뷰어", class: "rel-low" };
        
        return { score: rel, status, badge };
    }, [data]);

    // 로딩 처리
    if (!data) return <div className="loading-container">로딩 중...</div>;

    const { member, point } = data;

    // 배경 스타일 설정
    const isUrl = point?.bgSrc && (point.bgSrc.startsWith('http') || point.bgSrc.startsWith('/'));
    const heroStyle = isUrl ? { backgroundImage: `url(${point.bgSrc})` } : {};

    return (
        <div className="mypage-info-wrapper">
            {/* 1. 상단 히어로 (배경 + 아이콘 + 신뢰도 게이지) */}
            <div className={`profile-hero-v2 ${!isUrl ? point?.bgSrc : ""}`} style={heroStyle}>
                <div className="hero-overlay-v2">
                    <span style={{fontSize:"60px"}}>
                        <FaFish /> 
                        </span>
                    <h1 className={`nickname-v2 ms-2 ${point?.nickStyle || ''}`}>
                        {member.memberNickname}
                    </h1>
                        {reliabilityInfo.badge && (
                            <h3>
                            <span className={`reviewer-badge me-2 ${reliabilityInfo.badge.class}`}>
                                {reliabilityInfo.badge.text}
                            </span>
                            </h3>
                        )}
                </div>
            </div>


            {/* 2. 활동 통계 카드 (복구된 영역) */}

            <div className="activity-stats-row">
                <NavLink to={`/point/main`} >
                    <div className="stat-card">
                        <span className="stat-label text-truncate">보유 포인트</span>
                        <span className="stat-value text-gold text-truncate">{member.memberPoint?.toLocaleString()} P</span>
                    </div>
                </NavLink>
                <NavLink to={`/member/mypage/myreview/${loginId}`} >
                    <div className="stat-card">
                        <span className="stat-label  text-truncate">작성한 리뷰</span>
                        <span className="stat-value  text-truncate">{member.reviewCount || 0}</span>
                    </div>
                </NavLink>
                <NavLink to={`/member/mypage/mycontent/${loginId}`}>
                    <div className="stat-card">
                        <span className="stat-label  text-truncate">찜한 목록</span>
                        <span className="stat-value  text-truncate">{member.wishCount || 0}</span>
                    </div>
                </NavLink>
                <NavLink to={`/member/mypage/myquiz/${loginId}`} >
                    <div className="stat-card">
                        <span className="stat-label  text-truncate">참여 퀴즈</span>
                        <span className="stat-value  text-truncate">{member.quizCount || 0}</span>
                    </div>
                </NavLink>
            </div>

            {/* 3. 상세 정보 관리 (표 형식을 카드 스타일로 개선) */}
            <div className="account-info-card">
                <h3 className="card-title-v2">상세 정보 관리</h3>
                <div className="info-list-v2 mt-4">
                    <div className="info-item-v2">
                        <span className="label-v2">아이디</span>
                        <span className="value-v2">{member.memberId}</span>
                    </div>
                    <div className="info-item-v2">
                        <span className="label-v2">등급</span>
                        <span className="value-v2">{member.memberLevel}</span>
                    </div>
                    <div className="info-item-v2">
                        <span className="label-v2">이메일</span>
                        <span className="value-v2">{member.memberEmail}</span>
                    </div>
                    <div className="info-item-v2">
                        <span className="label-v2">연락처</span>
                        <span className="value-v2">{member.memberContact}</span>
                    </div>
                    <div className="info-item-v2">
                        <span className="label-v2">생년월일</span>
                        <span className="value-v2">{member.memberBirth}</span>
                    </div>
                    <div className="info-item-v2">
                        <span className="label-v2">주소</span>
                        <span className="value-v2">{member.memberAddress1} {member.memberAddress2}</span>
                    </div>
                </div>
            </div>

            {/* 4. 액션 버튼 영역 */}
            <div className="mypage-actions-v2">
                <Link to={`/member/mypage/edit/${loginId}`} className="btn-main">정보 수정하기</Link>
                <Link to={`/member/mypage/password/${loginId}`} className="btn-sub">비밀번호 변경</Link>
                <button className="btn-out" onClick={deleteMember}>회원 탈퇴</button>
            </div>
        </div>
    );
}