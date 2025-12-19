import React, { useEffect, useState, useCallback } from 'react';
import { toast } from "react-toastify";
import axios from "axios";
import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";
import Swal from 'sweetalert2'; // SweetAlert2 임포트 확인

export default function DailyQuest({ setTab, refreshPoint }) {
    const loginId = useAtomValue(loginIdState);
    const [quests, setQuests] = useState([]);
    const [timeLeft, setTimeLeft] = useState("");

    // 1. 자정까지 남은 시간 계산 (기존 유지)
    const calculateTimeLeft = useCallback(() => {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0); 
        const diff = midnight - now;
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }, []);

    useEffect(() => {
        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, [calculateTimeLeft]);

    // 2. 퀘스트 목록 로드
    const loadQuests = useCallback(async () => {
        if (!loginId) return;
        try {
            const resp = await axios.get("/point/quest/list");
            setQuests(resp.data);
        } catch (e) { console.error("퀘스트 로드 실패", e); }
    }, [loginId]);

    useEffect(() => { loadQuests(); }, [loadQuests]);

    // 3. 퀘스트 클릭 핸들러 (SweetAlert2 적용)
    const handleQuestClick = async (quest) => {
        if (quest.done) return;

        // [퀴즈 처리 - Swal.fire 적용]
        if (quest.action === "quiz") {
            try {
                const resp = await axios.get("/point/quest/quiz/random");
                if (!resp.data) {
                    toast.info("오늘의 퀴즈를 이미 완료하셨습니다.");
                    return;
                }

                const { quizNo, quizQuestion } = resp.data;

                // 제공해주신 handleInput 로직을 퀴즈에 맞게 변형하여 적용
                const { value: userAnswer } = await Swal.fire({
                    title: '🎬 영화/애니 퀴즈',
                    text: quizQuestion,
                    input: 'text',
                    inputLabel: '정답을 입력하세요',
                    inputPlaceholder: '정답은 무엇일까요?',
                    showCancelButton: true,
                    confirmButtonText: '제출',
                    cancelButtonText: '취소',
                    inputValidator: (value) => {
                        if (!value) return '정답을 입력해야 합니다!';
                    }
                });

                if (userAnswer) {
                    const checkResp = await axios.post("/point/quest/quiz/check", { 
                        quizNo: quizNo, 
                        answer: userAnswer 
                    });

                    if (checkResp.data === "success") {
                        await Swal.fire({
                            icon: 'success',
                            title: '정답입니다!',
                            text: '🎉 퀘스트가 완료되었습니다.',
                            timer: 1500,
                            showConfirmButton: false
                        });
                        loadQuests();
                    } else {
                        toast.error("오답입니다! 다시 시도해보세요.");
                    }
                }
            } catch (e) {
                console.error(e);
                toast.error("오류가 발생했습니다.");
            }
        } 
        else if (quest.action === "roulette") {
            setTab("roulette");
            toast.info("🎰 룰렛 탭으로 이동합니다!");
        } 
        else if (quest.type === "LIKE") {
            window.location.href = "/board/list";
        } 
        else if (quest.type === "REVIEW") {
            window.location.href = "/contents/genreList/listByGenre/전체";
        }
    };

    // 4. 보상 받기 (PointService 연동 및 UI 갱신)
    const handleClaim = async (type) => {
        try {
            const resp = await axios.post("/point/quest/claim", { type: type });
            if (resp.data.startsWith("success")) {
                const reward = resp.data.split(":")[1];
                toast.success(`보상 지급 완료! +${reward}P 💰`);
                
                loadQuests(); 
                if (typeof refreshPoint === 'function') refreshPoint();
            } else {
                toast.warning(resp.data.split(":")[1]);
            }
        } catch (e) { toast.error("보상 수령 실패"); }
    };

    return (
        <div className="quest-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-white mb-0">📜 일일 퀘스트</h5>
                <span className="badge bg-dark border border-secondary text-warning" style={{fontSize:'0.8rem', fontFamily:'monospace'}}>
                    ⏳ Reset {timeLeft}
                </span>
            </div>

            <div className="quest-list">
                {quests.map((q, index) => (
                    <div key={q.type || index} className={`quest-item ${q.done ? 'done-bg' : ''}`}>
                        <div className="d-flex align-items-center">
                            <div className="quest-icon-box me-3">{q.icon}</div>
                            <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className={`quest-title ${q.done ? 'text-decoration-line-through text-muted' : ''}`}>{q.title}</span>
                                    <span className="quest-reward text-warning fw-bold small">+{q.reward} P</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-end">
                                    <small className="text-secondary me-2" style={{fontSize:'0.8rem'}}>{q.desc}</small>
                                    {q.claimed ? (
                                        <span className="text-muted small">완료</span>
                                    ) : q.done ? (
                                        <button className="btn btn-xs btn-primary py-0 px-2 fw-bold" style={{fontSize:'0.75rem'}} onClick={() => handleClaim(q.type)}>받기</button>
                                    ) : (
                                        <span className="text-neon-mint small fw-bold">{q.current} / {q.target}</span>
                                    )}
                                </div>
                                <div className="progress mt-2" style={{height: '4px', backgroundColor: '#333'}}>
                                    <div className="progress-bar" style={{width: `${Math.min((q.current / q.target) * 100, 100)}%`, backgroundColor: q.done ? '#00d2d3' : '#e50914'}}></div>
                                </div>
                            </div>
                            {!q.done && (
                                <button className="btn btn-link text-secondary p-0 ms-2" onClick={() => handleQuestClick(q)} title="바로가기">🚀</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}