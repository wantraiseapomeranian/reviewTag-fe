import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaUserSlash, FaSave } from 'react-icons/fa'; // 아이콘 사용 (설치 필요: npm install react-icons)

export default function AdminMemberDetail() {
    const { memberId } = useParams(); // URL 파라미터 추출
    const navigate = useNavigate();
    
    const [member, setMember] = useState(null);
    const [activeTab, setActiveTab] = useState('quiz'); // 기본 탭

    // 데이터 로드
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await axios.get(`/admin/members/${memberId}`)
                setMember(res.data);
            } catch (error) {
                console.error(error);
                Swal.fire("오류", "회원 정보를 불러오지 못했습니다.", "error");
                navigate('/admin/member');
            }
        };
        fetchDetail();
    }, [memberId, navigate]);

    // 등급 변경
    const handleGradeChange = async (e) => {
        const newGrade = e.target.value;

        try {
            await axios.patch(
                `/admin/members/${memberId}/grade?grade=${newGrade}`);

            Swal.fire({
                icon: 'success',
                title: '등급 변경 완료',
                text: `회원 등급이 [${newGrade}](으)로 변경되었습니다.`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500
            });

            setMember(prev => ({ ...prev, memberLevel: newGrade }));

        } catch (error) {
            console.error("등급 변경 에러", error);
            Swal.fire('오류', '등급 변경 중 문제가 발생했습니다.', 'error');
        }
    };

    if (!member) return <div className="text-white text-center p-5">로딩중...</div>;

    return (
        <div className="admin-detail-container text-white">
            
            {/* 1. 상단 헤더 (뒤로가기 + 타이틀) */}
            <div className="d-flex align-items-center mb-4 border-bottom border-secondary pb-3">
                <button className="btn btn-outline-light me-3" onClick={() => navigate('/admin/member')}>
                    <FaArrowLeft /> 목록으로
                </button>
                <h3 className="mb-0 fw-bold">👤 회원 상세 정보</h3>
            </div>

            <div className="row">
                {/* --- [왼쪽] 프로필 요약 & 관리 카드 --- */}
                <div className="col-md-4 mb-4">
                    <div className="card bg-dark border-secondary shadow-sm h-100">
                        <div className="card-body text-center">
                            {/* 프로필 이미지 */}
                            {/* <img 
                                src={member.memberImg || "https://via.placeholder.com/150"} 
                                alt="프로필" 
                                className="rounded-circle mb-3 border border-2 border-warning"
                                style={{width: '120px', height: '120px', objectFit: 'cover'}}
                            /> */}
                            <h4 className="text-white fw-bold">{member.memberNickname}</h4>
                            <p className="text-muted mb-4">ID: {member.memberId}</p>

                            {/* 정보 테이블 */}
                            <ul className="list-group list-group-flush text-start rounded mb-4">
                                <li className="list-group-item bg-dark text-white border-secondary d-flex justify-content-between">
                                    <span className="text-secondary">가입일</span>
                                    <span>{new Date(member.memberJoin).toLocaleDateString()}</span>
                                </li>
                                <li className="list-group-item bg-dark text-white border-secondary d-flex justify-content-between">
                                    <span className="text-secondary">포인트</span>
                                    <span className="text-warning fw-bold">{member.memberPoint.toLocaleString()} P</span>
                                </li>
                                <li className="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center">
                                    <span className="text-secondary">등급</span>
                                    <select 
                                        className="form-select form-select-sm bg-secondary text-white border-0 w-auto"
                                        value={member.memberLevel}
                                        onChange={handleGradeChange}
                                    >
                                        <option value="관리자">관리자</option>
                                        <option value="우수회원">우수회원</option>
                                        <option value="일반회원">일반회원</option>
                                    </select>
                                </li>
                            </ul>

                            {/* 관리 버튼 */}
                            <div className="d-grid gap-2">
                                <button className="btn btn-danger">
                                    <FaUserSlash className="me-2" /> 강제 탈퇴 처리
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- [오른쪽] 활동 상세 내역 탭 --- */}
                <div className="col-md-8">
                    <div className="card bg-dark border-secondary shadow-sm h-100">
                        <div className="card-header border-secondary bg-transparent">
                            <ul className="nav nav-tabs card-header-tabs border-0">
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link border-0 ${activeTab === 'quiz' ? 'active bg-secondary text-white' : 'text-secondary'}`}
                                        onClick={() => setActiveTab('quiz')}
                                    >
                                        만든 퀴즈
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link border-0 ${activeTab === 'review' ? 'active bg-secondary text-white' : 'text-secondary'}`}
                                        onClick={() => setActiveTab('review')}
                                    >
                                        작성 리뷰
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link border-0 ${activeTab === 'report' ? 'active bg-secondary text-white' : 'text-secondary'}`}
                                        onClick={() => setActiveTab('report')}
                                    >
                                        신고 내역
                                    </button>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="card-body overflow-auto" style={{maxHeight: '600px'}}>
                            {/* 1. 퀴즈 탭 */}
                            {activeTab === 'quiz' && (
                                <div>
                                    <h5 className="mb-3">❓ 등록한 퀴즈 목록</h5>
                                    {/* 여기에 퀴즈 리스트 컴포넌트 or 테이블 */}
                                    <div className="alert alert-secondary bg-opacity-10 border-0 text-white">
                                        아직 등록한 퀴즈가 없습니다.
                                    </div>
                                </div>
                            )}

                            {/* 2. 리뷰 탭 */}
                            {activeTab === 'review' && (
                                <div>
                                    <h5 className="mb-3">📝 작성한 리뷰 목록</h5>
                                    {/* 여기에 리뷰 리스트 */}
                                </div>
                            )}

                            {/* 3. 신고 탭 */}
                            {activeTab === 'report' && (
                                <div>
                                    <h5 className="mb-3 text-danger">🚨 신고 당한 기록</h5>
                                    {/* 여기에 신고 내역 */}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}