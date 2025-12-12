import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";

// closeModal: 모달 닫기 함수
// onSuccess: 후원 성공 시 부모 컴포넌트(포인트 갱신) 실행 함수
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

        if (!window.confirm(`${targetId}님에게 ${parseInt(amount).toLocaleString()}P를 선물하시겠습니까?`)) {
            return;
        }

        setLoading(true);

        try {
            // 2. 서버 요청
            // (Controller에 /point/store/donate 매핑이 필요합니다)
            const resp = await axios.post("/point/donate", {
                targetId: targetId,
                amount: parseInt(amount)
            });

            // 3. 응답 처리
            if (resp.data === "success") {
                // 성공 토스트
                toast.success(`🎁 ${targetId}님에게 후원 완료!`);
                
                // 포인트 갱신 및 모달 닫기
                if (onSuccess) onSuccess(); 
                closeModal();
            } else {
                // 실패 토스트 (예: 잔액 부족, 아이디 없음)
                // "fail:잔액부족" 처럼 오면 뒷부분만 보여줌
                const msg = resp.data.startsWith("fail:") ? resp.data.substring(5) : resp.data;
                toast.error(msg);
            }
        } catch (e) {
            console.error(e);
            toast.error("후원 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        // 모달 배경 (Overlay)
        <div className="modal-overlay" style={overlayStyle}>
            <div className="modal-dialog" style={{ maxWidth: '400px', width: '100%', margin: '0 20px' }}>
                <div className="modal-content shadow-lg border-0">
                    
                    {/* 모달 헤더 */}
                    <div className="modal-header bg-warning text-white">
                        <h5 className="modal-title fw-bold">🎁 포인트 선물하기</h5>
                        <button type="button" className="btn-close" onClick={closeModal}></button>
                    </div>

                    {/* 모달 본문 */}
                    <div className="modal-body p-4">
                        <div className="mb-3">
                            <label className="form-label fw-bold">받는 사람 ID</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="친구 아이디 입력"
                                value={targetId}
                                onChange={(e) => setTargetId(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold">선물할 포인트</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                placeholder="금액 입력 (예: 1000)"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        <div className="d-grid gap-2">
                            <button 
                                className="btn btn-warning fw-bold text-white py-2" 
                                onClick={handleDonate}
                                disabled={loading}
                            >
                                {loading ? "처리 중..." : "보내기 🚀"}
                            </button>
                            <button 
                                className="btn btn-light text-secondary" 
                                onClick={closeModal}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 간단한 모달 스타일 (CSS 파일에 넣어도 됨)
const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 검정 배경
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
};