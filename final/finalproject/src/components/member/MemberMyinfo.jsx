import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAtom, useSetAtom } from "jotai"
import { clearLoginState, loginIdState, loginLevelState, loginNicknameState } from "../../utils/jotai"
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./MemberCustom.css"; 

export default function MemberMyinfo() {
    const { loginId } = useParams();
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`/member/mypage/${loginId}`)
            .then(res => setData(res.data))
            .catch(err => console.error("데이터 로딩 실패", err));
    }, [loginId]);

    const deleteMember = async () => {
        if (!window.confirm("⚠️ 경고: 탈퇴 시 모든 신뢰도와 포인트가 사라집니다. 계속하시겠습니까?")) return;
        try {
            await axios.delete(`/member/${loginId}`);
            alert("탈퇴 처리가 완료되었습니다.");
            navigate("/");
        } catch (err) { alert("처리 중 오류 발생"); }
    };

    if (!data) return <div style={{color: '#fff', textAlign: 'center', paddingTop: '40vh'}}>로딩 중...</div>;

    const { member, point } = data;
    const reliability = member.memberReliability || 0;
    const relStatus = reliability <= 49 ? "danger" : "safe";

    const isUrl = point.bgSrc && (point.bgSrc.startsWith('http') || point.bgSrc.startsWith('/'));
    const heroStyle = isUrl ? { backgroundImage: `url(${point.bgSrc})` } : {};
    const bgClass = !isUrl ? point.bgSrc : "";

    return (
        <div className="mypage-info-wrapper">
            {/* 1. 상단 히어로 (골드 엣지 + 신뢰도 게이지) */}
            <div className={`profile-hero-v2 ${bgClass}`} style={heroStyle}>
                <div className="hero-overlay-v2">
                    <img src={point.iconSrc} alt="Icon" className="avatar-img-v2" style={{width: '130px', marginBottom: '15px'}} />
                    <h1 className={`nickname-v2 ${point.nickStyle || ''}`}>{point.nickname}</h1>
                    <div className="reliability-section" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <div className="reliability-bar-container" style={{width: '350px', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', overflow: 'hidden'}}>
                            <div className={`rel-fill ${relStatus}`} style={{ width: `${reliability}%`, height: '100%' }}></div>
                        </div>
                        <span className={`rel-text ${relStatus}`} style={{marginTop: '12px', fontWeight: '800', fontSize: '1.2rem'}}>
                             {relStatus === 'danger' ? '⚠️ 위험: ' : '신뢰도: '} {reliability}%
                        </span>
                    </div>
                </div>
            </div>


export default function MemberMyinfo() {
    const { loginId } = useParams();
    const [loginNickname, setLoginNickname] = useAtom(loginNicknameState);

    const [memberData, setMemberData] = useState({});
    const clearLogin = useSetAtom(clearLoginState);
    const navigate = useNavigate();
    //effect
    useEffect(() => {
        if (loginId === null) return;
        axios.get(`/member/mypage/${loginId}`)
            .then(response => {
                setMemberData(response.data);
            })
    }, []);

    //callback
    const deleteMember = useCallback(async () => {
        const choice = window.confirm("정말 탈퇴하시겠습니까?");
        if (choice === false) return;

        await axios.delete(`/member/${loginId}`);
        navigate("/");
        clearLogin();
    })

    //신뢰도 레벨
    const rel = memberData?.memberReliability ?? 0;

    const relRowLevel = useMemo(() => {
        return rel >= 6 && rel <= 19;
    }, [rel])

    const relMiddleLevel = useMemo(() => {
        return rel >= 20 && rel <= 49;
    }, [rel])

    const relHighLevel = useMemo(() => {
        return rel >= 50;
    }, [rel])

    return (<>
        <h1 className="text-center mt-4"> {loginNickname}님의 <span className="text-info">정보</span></h1>

        <div className="mypage-table-wrapper">
            <table className="table table-hover mypage-table">
                <tbody>
                    <tr>
                        <td>아이디</td>
                        <td>{memberData.memberId}</td>
                    </tr>
                    <tr>
                        <td>닉네임</td>
                        <td>
                            <span>{memberData.memberNickname}</span>
                            {relRowLevel && (
                                <span className="Rel ms-3">🟢 활동 리뷰어</span>
                            )}
                            {relMiddleLevel && (
                                <span className="Rel2 ms-3">🔵 신뢰 리뷰어</span>
                            )}
                            {relHighLevel && (
                                <span className="Rel2 ms-3">🔷 검증된 리뷰어 </span>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>등급</td>
                        <td>{memberData.memberLevel}</td>
                    </tr>
                    <tr>
                        <td>포인트</td>
                        <td>{memberData.memberPoint}</td>
                    </tr>
                    <tr>
                        <td>이메일</td>
                        <td>{memberData.memberEmail}</td>
                    </tr>
                    <tr>
                        <td>생년월일</td>
                        <td>{memberData.memberBirth}</td>
                    </tr>
                    <tr>
                        <td>연락처</td>
                        <td>{memberData.memberContact}</td>
                    </tr>
                    <tr>
                        <td>주소</td>
                        <td>{memberData.memberAddress1} - {memberData.memberAddress2}</td>
                    </tr>
                </tbody>
            </table>
            <div className="row mt-2">
                <div className="col">
                    <Link to={`/member/mypage/edit/${loginId}`} className="btn btn-secondary me-2">기본정보 수정</Link>
                    <Link to={`/member/mypage/password/${loginId}`} className="btn btn-secondary me-2">비밀번호 변경</Link>
                    <div className="btn btn-danger" onClick={deleteMember}>탈퇴</div>
                </div>
            </div>
        </div>

            {/* 2. 활동 통계 카드 (복구된 영역) */}
            <div className="activity-stats-row">
                <div className="stat-card">
                    <span className="stat-label">보유 포인트</span>
                    <span className="stat-value text-red">{point.point?.toLocaleString()} P</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">작성한 리뷰</span>
                    <span className="stat-value">{member.reviewCount || 0}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">찜한 목록</span>
                    <span className="stat-value">{member.wishCount || 0}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">참여 퀴즈</span>
                    <span className="stat-value">{member.quizCount || 0}</span>
                </div>
            </div>

            {/* 3. 계정 상세 정보 */}
            <div className="account-info-card">
                <h3 className="card-title-v2" style={{color: 'var(--gold-main)', borderLeft: '5px solid var(--gold-main)', paddingLeft: '20px', marginBottom: '40px', fontSize: '1.8rem', fontWeight: '900'}}>상세 정보 관리</h3>
                <div className="info-list-v2">
                    <div className="info-item-v2"><span className="label-with-icon">아이디</span><span className="value-v2">{member.memberId}</span></div>
                    <div className="info-item-v2"><span className="label-with-icon">이메일</span><span className="value-v2">{member.memberEmail}</span></div>
                    <div className="info-item-v2"><span className="label-with-icon">연락처</span><span className="value-v2">{member.memberContact}</span></div>
                    <div className="info-item-v2"><span className="label-with-icon">생년월일</span><span className="value-v2">{member.memberBirth}</span></div>
                </div>
            </div>

            {/* 4. 버튼 영역 */}
            <div className="mypage-actions-v2">
                <Link to="/member/edit" className="btn-main">정보 수정하기</Link>
                <Link to="/member/password" className="btn-sub">비밀번호 변경</Link>
                <button className="btn-out" onClick={deleteMember}>회원 탈퇴</button>
            </div>
        </div>
    );
}