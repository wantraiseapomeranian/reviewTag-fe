import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminQuizCard from './AdminQuizCard';
import './AdminQuiz.css'; // CSS 임포트
import { loginIdState, loginLevelState } from '../../utils/jotai';
import { useAtom, useAtomValue } from 'jotai';

export default function AdminQuizPage() {
    
    //state
    const loginId = useAtomValue(loginIdState);

    const [currentTab, setCurrentTab] = useState('active'); 
    const [quizList, setQuizList] = useState([]);
    const [loading, setLoading] = useState(false);

    // 데이터 로딩 함수
    const fetchQuizList = async () => {

        if (!loginId) return;

        setLoading(true);
        try {
            const { data } = await axios.get(`/admin/quizzes/reports`, {
                params: { status: currentTab }
            });
            setQuizList(data);
        } catch (error) {
            console.error("목록 로딩 실패", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (loginId) {
            fetchQuizList();
        }
    }, [currentTab, loginId]);

    return (
        <div className="admin-quiz-container">
            
            {/* 1. 헤더 영역 */}
            <div className="admin-page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
                <h3 className="admin-title mb-0">
                    👮‍♀️ 퀴즈 신고 관리
                </h3>
                {/* 필요하다면 여기에 '새로고침' 버튼 등을 둘 수 있음 */}
                <button className="btn btn-sm btn-outline-secondary" onClick={fetchQuizList}>
                    🔄 목록 갱신
                </button>
            </div>

            {/* 2. 탭 메뉴 (CSS 클래스 적용) */}
            <ul className="nav nav-tabs admin-tabs mb-4">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${currentTab === 'active' ? 'active' : ''}`}
                        onClick={() => setCurrentTab('active')}
                    >
                        🚨 접수된 신고 <span className="badge bg-danger ms-1 rounded-pill">Active</span>
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${currentTab === 'blind' ? 'blind' : ''}`}
                        onClick={() => setCurrentTab('blind')}
                    >
                        🥊 블라인드된 신고
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${currentTab === 'deleted' ? 'active' : ''}`}
                        onClick={() => setCurrentTab('deleted')}
                    >
                        🗑️ 삭제된 퀴즈
                    </button>
                </li>
            </ul>

            {/* 3. 리스트 영역 */}
            <div className="mt-4">
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">데이터를 불러오는 중입니다...</p>
                    </div>
                ) : (
                   <>
                        {quizList.length === 0 ? (
                            // [수정] style 속성 제거 (CSS에서 width: 100% 줬으므로)
                            <div className="empty-state-box">
                                <div className="empty-icon">✨</div>
                                <h5>데이터가 없습니다.</h5>
                                <p>접수된 신고가 없거나 처리할 항목이 없습니다.</p>
                            </div>
                        ) : (
                            // [수정] 데이터가 있을 때만 그리드 레이아웃 적용
                            <div className="quiz-list-grid">
                                {quizList.map(quiz => (
                                    <AdminQuizCard 
                                        key={quiz.quizId} 
                                        quizData={quiz} 
                                        refreshList={fetchQuizList} 
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}