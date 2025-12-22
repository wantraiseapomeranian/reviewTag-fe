import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate, NavLink } from "react-router-dom";
import { useAtom, useSetAtom } from "jotai";
import axios from "axios";
import Swal from "sweetalert2"; 
import { clearLoginState, loginNicknameState } from "../../utils/jotai";
import "./MemberCustom.css"; 

export default function MemberMyinfo() {
    const { loginId } = useParams();
    const navigate = useNavigate();

    // 전역 상태 관리
    const [loginNickname, setLoginNickname] = useAtom(loginNicknameState);
    const clearLogin = useSetAtom(clearLoginState);

    // 통합 데이터 상태 (MemberDto, MemberPointVO, counts 포함)
    const [data, setData] = useState(null);

    // 마이페이지 데이터 로드 로직
    const loadData = useCallback(async () => {
        if (!loginId) return;
        try {
            const res = await axios.get(`/member/mypage/${loginId}`);
            setData(res.data);
            if (res.data.member?.memberNickname) {
                setLoginNickname(res.data.member.memberNickname);
            }
        } catch (err) {
            console.error("데이터 로딩 실패", err);
        }
    }, [loginId, setLoginNickname]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // SweetAlert2 기반 회원 탈퇴
    const deleteMember = useCallback(async () => {
        const result = await Swal.fire({
            title: '정말 탈퇴하시겠습니까?',
            text: "탈퇴 시 보유 포인트와 아이템이 모두 삭제되며 복구할 수 없습니다.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff3b30', 
            cancelButtonColor: '#333',
            confirmButtonText: '탈퇴하기',
            cancelButtonText: '취소',
            background: '#1a1a1a', 
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/member/${loginId}`);
                await Swal.fire({
                    title: '탈퇴 완료',
                    text: '그동안 이용해주셔서 감사합니다.',
                    icon: 'success',
                    background: '#1a1a1a',
                    color: '#fff',
                    confirmButtonColor: '#ffd700'
                });
                clearLogin();
                navigate("/");
            } catch (err) {
                Swal.fire({
                    title: '오류 발생',
                    text: '처리 중 문제가 발생했습니다.',
                    icon: 'error',
                    background: '#1a1a1a',
                    color: '#fff'
                });
            }
        }
    }, [loginId, navigate, clearLogin]);

    // 신뢰도 점수에 따른 배지 계산
    const reliabilityInfo = useMemo(() => {
        if (!data?.member) return { badge: null };
        const rel = data.member.memberReliability || 0;
        let badge = null;
        if (rel >= 50) badge = { text: "🔷 검증된 리뷰어", class: "rel-high" };
        else if (rel >= 20) badge = { text: "🔵 신뢰 리뷰어", class: "rel-mid" };
        else if (rel >= 6) badge = { text: "🟢 활동 리뷰어", class: "rel-low" };
        return { badge };
    }, [data]);

    if (!data) return <div className="loading-container">데이터 로딩 중...</div>;

    const { member, point, reviewCount, wishCount, quizCount } = data;

    // 배경 이미지 처리 (URL인 경우 인라인 스타일, 클래스명인 경우 CSS 클래스 바인딩)
    const isUrl = point?.bgSrc && (point.bgSrc.startsWith('http') || point.bgSrc.startsWith('/'));
    const heroStyle = isUrl ? { backgroundImage: `url(${point.bgSrc})` } : {};

    return (
        <div className="mypage-info-wrapper">
            {/* 1. 상단 히어로: 배경(bgSrc)과 프레임(frameSrc) 클래스를 동시 적용 */}
            <div 
                className={`profile-hero-v2 ${!isUrl ? (point?.bgSrc || "") : ""} ${point?.frameSrc || ""}`} 
                style={heroStyle}
            >
                <div className="hero-overlay-v2">
                    <img src={point?.iconSrc} alt="Icon" className="avatar-img-v2" />
                    <h1 className={`nickname-v2 ${point?.nickStyle || ''}`}>
                        {member.memberNickname}
                    </h1>
                    {reliabilityInfo.badge && (
                        <div className="reviewer-badge-container">
                            <span className={`reviewer-badge ${reliabilityInfo.badge.class}`}>
                                {reliabilityInfo.badge.text}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. 활동 통계 카드 (백엔드 집계 데이터 반영) */}
            <div className="activity-stats-row">
                <NavLink to="/point/main">
                    <div className="stat-card">
                        <span className="stat-label">보유 포인트</span>
                        <span className="stat-value text-gold">{member.memberPoint?.toLocaleString()} P</span>
                    </div>
                </NavLink>
                <NavLink to={`/member/mypage/myreview/${loginId}`}>
                    <div className="stat-card">
                        <span className="stat-label">작성한 리뷰</span>
                        <span className="stat-value">{reviewCount || 0}</span>
                    </div>
                </NavLink>
                <NavLink to={`/member/mypage/mycontent/${loginId}`}>
                    <div className="stat-card">
                        <span className="stat-label">찜한 목록</span>
                        <span className="stat-value">{wishCount || 0}</span>
                    </div>
                </NavLink>
                <NavLink to={`/member/mypage/myquiz/${loginId}`}>
                    <div className="stat-card">
                        <span className="stat-label">참여 퀴즈</span>
                        <span className="stat-value">{quizCount || 0}</span>
                    </div>
                </NavLink>
            </div>

            {/* 3. 계정 상세 정보 관리 */}
            <div className="account-info-card">
                <h3 className="card-title-v2">상세 정보 관리</h3>
                <div className="info-list-v2">
                    <div className="info-item-v2"><span className="label-v2">아이디</span><span className="value-v2">{member.memberId}</span></div>
                    <div className="info-item-v2"><span className="label-v2">등급</span><span className="value-v2">{member.memberLevel}</span></div>
                    <div className="info-item-v2"><span className="label-v2">이메일</span><span className="value-v2">{member.memberEmail}</span></div>
                    <div className="info-item-v2"><span className="label-v2">연락처</span><span className="value-v2">{member.memberContact}</span></div>
                    <div className="info-item-v2"><span className="label-v2">생년월일</span><span className="value-v2">{member.memberBirth}</span></div>
                    <div className="info-item-v2">
                        <span className="label-v2">주소</span>
                        <span className="value-v2">{member.memberAddress1} {member.memberAddress2}</span>
                    </div>
                </div>
            </div>

            {/* 4. 액션 버튼 */}
            <div className="mypage-actions-v2">
                <Link to={`/member/mypage/edit/${loginId}`} className="btn-main">정보 수정하기</Link>
                <Link to={`/member/mypage/password/${loginId}`} className="btn-sub">비밀번호 변경</Link>
                <button className="btn-out" onClick={deleteMember}>회원 탈퇴</button>
            </div>
        </div>
    );
}