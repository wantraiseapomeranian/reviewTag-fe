import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";
import Swal from "sweetalert2"; 
import "./Donate.css";

export default function Donate({ closeModal, onSuccess }) {
    const loginId = useAtomValue(loginIdState);

    const [targetId, setTargetId] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const handleDonate = async () => {
        // 1. 유효성 검사
        if (!targetId.trim()) {
            return toast.warning("받는 사람의 ID를 입력해주세요. 🧐");
        }
        if (targetId === loginId) {
            return toast.warning("본인에게는 선물할 수 없습니다. 😅");
        }
        if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
            return toast.warning("올바른 포인트 금액을 입력해주세요.");
        }

        // 2. 확인창
        const result = await Swal.fire({
            title: '포인트 선물',
            html: `<div style="text-align: center;">
                    <b style="color: #f1c40f;">${targetId}</b>님에게<br/>
                    <b style="font-size: 1.5rem;">${parseInt(amount).toLocaleString()} P</b>를<br/>
                    선물하시겠습니까?
                   </div>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#f1c40f',
            cancelButtonColor: '#444',
            confirmButtonText: '네, 보냅니다! 🚀',
            cancelButtonText: '취소',
            background: '#1a1a1a',
            color: '#fff'
        });

        if (!result.isConfirmed) return;

        setLoading(true);

        try {
            // 3. 서버 요청 (백엔드: @PostMapping("/donate") 호출)
            const resp = await axios.post("/point/donate", {
                targetId: targetId,
                amount: parseInt(amount)
            });

            // 4. 성공 응답 처리 (ResponseEntity.ok("success"))
            if (resp.data === "success") {
                await Swal.fire({
                    icon: 'success',
                    title: '선물 완료!',
                    text: `${targetId}님에게 마음을 전달했습니다.`,
                    showConfirmButton: false,
                    timer: 2000,
                    background: '#1a1a1a',
                    color: '#fff',
                    backdrop: `rgba(0,0,0,0.6) url("https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmZ0M255NnYycHF5NmR3eXNxcXRxNmR3eXNxcXRxNmR3eXNxcXRxJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/26tOZ42Mg6pbMubM4/giphy.gif") center center no-repeat`
                });
                
                if (onSuccess) onSuccess(); 
                closeModal();
            }
        } catch (e) {
            // 5. 서버에서 보낸 에러 메시지 처리 (예: "보유 포인트가 부족합니다.")
            const errorMsg = e.response?.data || "시스템 오류로 선물을 보내지 못했습니다.";
            
            Swal.fire({
                icon: 'error',
                title: '선물 실패',
                text: errorMsg,
                background: '#1a1a1a',
                color: '#fff'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="donate-modal-overlay" onClick={closeModal}>
            <div className="donate-modal-content animate__animated animate__zoomIn" onClick={(e) => e.stopPropagation()}>
                
                <div className="donate-header">
                    <div className="donate-icon-circle">🎁</div>
                    <h4 className="donate-title">POINT GIFT</h4>
                    <p className="donate-subtitle">친구에게 따뜻한 마음을 전하세요</p>
                    <button className="donate-close-btn" onClick={closeModal}>&times;</button>
                </div>

                <div className="donate-body">
                    <div className="input-group-glass">
                        <label className="input-label">받는 사람 아이디</label>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="상대방의 ID를 입력하세요"
                            value={targetId}
                            onChange={(e) => setTargetId(e.target.value)}
                        />
                    </div>

                    <div className="input-group-glass">
                        <label className="input-label">선물할 포인트 금액</label>
                        <div className="amount-input-wrapper">
                            <input 
                                type="number" 
                                className="input-field amount-field" 
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <span className="unit-text">P</span>
                        </div>
                    </div>
                </div>

                <div className="donate-footer">
                    <button 
                        className="donate-submit-btn" 
                        onClick={handleDonate}
                        disabled={loading}
                    >
                        {loading ? "전송 중..." : "포인트 선물하기"}
                    </button>
                    <button className="donate-cancel-btn" onClick={closeModal}>닫기</button>
                </div>
            </div>
        </div>
    );
}