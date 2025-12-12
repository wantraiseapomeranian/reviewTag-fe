import { useState } from "react";
import axios from "axios";
// ★ [Toast 1] toast 임포트 (Container는 부모에 있으므로 필요 없음)
import { toast } from "react-toastify"; 

export default function ProductAdd({ closeModal, reload }) {
    // 입력값 관리
    const [input, setInput] = useState({
        pointItemName: "",
        pointItemPrice: 0,
        pointItemStock: 10,
        pointItemType: "FOOD", // 기본값
        pointItemReqLevel: "일반회원", // 기본값
        pointItemContent: "",
        pointItemSrc: "",
        pointItemUniques: 0 // ★ 기본값: 0 (중복 구매 가능)
    });

    const changeInput = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const handleAdd = async () => {
        // ★ [Toast 2] 유효성 검사 경고 알림
        if (!input.pointItemName || !input.pointItemPrice) {
            return toast.warning("상품명과 가격은 필수입니다. 😫");
        }

        try {
            // (권장) 숫자는 확실하게 숫자로 변환해서 전송
            const payload = {
                ...input,
                pointItemPrice: Number(input.pointItemPrice),
                pointItemStock: Number(input.pointItemStock),
                pointItemUniques: Number(input.pointItemUniques)
            };

            const resp = await axios.post("/point/store/item/add", payload);
            
            if (resp.data === "success") {
                // ★ [Toast 3] 성공 알림
                toast.success("📦 상품 등록 완료!"); 
                reload(); // 목록 새로고침
                closeModal(); // 모달 닫기
            } else if (resp.data === "fail_auth") {
                // ★ [Toast 4] 에러 알림
                toast.error("관리자만 등록할 수 있습니다. 👮");
            } else {
                toast.error("등록 실패: " + resp.data);
            }
        } catch (e) {
            // ★ [Toast 5] 서버 에러 알림
            toast.error("서버 오류가 발생했습니다. ☠️");
            console.error(e);
        }
    };

    return (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
                <div className="modal-content shadow">
                    <div className="modal-header bg-primary bg-opacity-10">
                        <h5 className="modal-title fw-bold text-primary">📦 신규 상품 등록</h5>
                        <button type="button" className="btn-close" onClick={closeModal}></button>
                    </div>
                    <div className="modal-body">
                        
                        {/* 상품명 */}
                        <div className="mb-2">
                            <label className="form-label fw-bold small">상품명</label>
                            <input type="text" name="pointItemName" className="form-control" onChange={changeInput} placeholder="예: 황금 올리브 치킨" />
                        </div>

                        {/* 가격 & 재고 */}
                        <div className="row mb-2">
                            <div className="col">
                                <label className="form-label fw-bold small">가격(P)</label>
                                <input type="number" name="pointItemPrice" className="form-control" onChange={changeInput} placeholder="0" />
                            </div>
                            <div className="col">
                                <label className="form-label fw-bold small">재고</label>
                                <input type="number" name="pointItemStock" className="form-control" value={input.pointItemStock} onChange={changeInput} />
                            </div>
                        </div>

                        {/* 유형 & 등급 */}
                        <div className="row mb-2">
                            <div className="col">
                                <label className="form-label fw-bold small">유형</label>
                                <select name="pointItemType" className="form-select" onChange={changeInput} value={input.pointItemType}>
                                    <option value="">== 유형 선택 ==</option>
                                    <optgroup label="기능성 아이템">
                                        <option value="CHANGE_NICK">닉네임 변경권</option>
                                        <option value="LEVEL_UP">레벨업 부스터</option>
                                        <option value="TICKET">기타 이용권</option>
                                    </optgroup>
                                    <optgroup label="치장/꾸미기">
                                        <option value="DECO_NICK">닉네임 치장</option>
                                        <option value="DECO_ICON">프로필 아이콘</option>
                                        <option value="DECO_BG">배경 스킨</option>
                                    </optgroup>
                                    <optgroup label="현물/기프티콘">
                                        <option value="FOOD">식품/카페</option>
                                        <option value="GIFT">상품권</option>
                                        <option value="GOODS">실물 굿즈</option>
                                    </optgroup>
                                    <optgroup label="이벤트/기타">
                                        <option value="VOUCHER">포인트 충전권</option>
                                        <option value="RANDOM_POINT">랜덤 박스</option>
                                        <option value="ICON_GACHA">아이콘뽑기</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div className="col">
                                <label className="form-label fw-bold small">필요 등급</label>
                                <select name="pointItemReqLevel" className="form-select" onChange={changeInput} value={input.pointItemReqLevel}>
                                    <option value="일반회원">일반회원</option>
                                    <option value="우수회원">우수회원</option>
                                    <option value="관리자">관리자</option>
                                </select>
                            </div>
                        </div>

                        {/* 희귀도 (중복 구매 설정) */}
                        <div className="mb-2">
                            <label className="form-label fw-bold small">구매 제한 (희귀도)</label>
                            <select name="pointItemUniques" className="form-select" onChange={changeInput} value={input.pointItemUniques}>
                                <option value="0">🟢 중복 구매 가능 (여러 개 소지 가능)</option>
                                <option value="1">🔴 중복 구매 불가 (1인당 1개 한정)</option>
                            </select>
                        </div>

                        {/* 이미지 & 설명 */}
                        <div className="mb-2">
                            <label className="form-label fw-bold small">이미지 URL</label>
                            <input type="text" name="pointItemSrc" className="form-control" placeholder="http://..." onChange={changeInput} />
                        </div>
                        <div className="mb-2">
                            <label className="form-label fw-bold small">설명</label>
                            <textarea name="pointItemContent" className="form-control" rows="2" onChange={changeInput} placeholder="상품 설명을 입력하세요."></textarea>
                        </div>

                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>취소</button>
                        <button type="button" className="btn btn-primary fw-bold" onClick={handleAdd}>등록하기</button>
                    </div>
                </div>
            </div>
        </div>
    );
}