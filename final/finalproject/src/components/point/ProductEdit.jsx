import { useState, useEffect } from "react";
import axios from "axios";
// ★ [Toast 1] toast 임포트
import { toast } from "react-toastify";

export default function ProductEdit({ target, closeModal, reload }) {
    const [input, setInput] = useState({
        pointItemNo: 0,
        pointItemName: "",
        pointItemPrice: 0,
        pointItemStock: 0,
        pointItemType: "FOOD",
        pointItemReqLevel: "일반회원",
        pointItemContent: "",
        pointItemSrc: "",
        pointItemUniques: 0
    });

    // 모달이 열리면 target 데이터를 input에 채워넣음
    useEffect(() => {
        if(target) {
            setInput({ ...target });
        }
    }, [target]);

    const changeInput = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const handleEdit = async () => {
        // 유효성 검사 (선택 사항)
        if (!input.pointItemName || input.pointItemPrice < 0) {
            return toast.warning("상품명과 가격을 올바르게 입력해주세요. 🤔");
        }

        try {
            // (권장) 숫자는 확실하게 숫자로 변환해서 전송
            const payload = {
                ...input,
                pointItemPrice: Number(input.pointItemPrice),
                pointItemStock: Number(input.pointItemStock),
                pointItemUniques: Number(input.pointItemUniques)
            };

            // 수정 API 호출
            const resp = await axios.post("/point/store/item/edit", payload);
            
            if (resp.data === "success") {
                // ★ [Toast 2] 성공 알림
                toast.success("🛠️ 상품 정보가 수정되었습니다!");
                reload();
                closeModal();
            } else {
                // ★ [Toast 3] 실패 알림
                toast.error("수정 실패: " + resp.data);
            }
        } catch (e) {
            console.error(e);
            // ★ [Toast 4] 에러 알림
            toast.error("서버 오류가 발생했습니다. ☠️");
        }
    };

    return (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
                <div className="modal-content shadow">
                    <div className="modal-header bg-warning bg-opacity-10">
                        <h5 className="modal-title fw-bold text-dark">🛠️ 상품 정보 수정</h5>
                        <button type="button" className="btn-close" onClick={closeModal}></button>
                    </div>
                    <div className="modal-body">
                        
                        {/* 상품명 */}
                        <div className="mb-2">
                            <label className="form-label fw-bold small">상품명</label>
                            <input type="text" name="pointItemName" value={input.pointItemName || ""} className="form-control" onChange={changeInput} />
                        </div>

                        {/* 가격 & 재고 */}
                        <div className="row mb-2">
                            <div className="col">
                                <label className="form-label fw-bold small">가격</label>
                                <input type="number" name="pointItemPrice" value={input.pointItemPrice} className="form-control" onChange={changeInput} />
                            </div>
                            <div className="col">
                                <label className="form-label fw-bold small">재고</label>
                                <input type="number" name="pointItemStock" value={input.pointItemStock} className="form-control" onChange={changeInput} />
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
                                              <option value="ICON_GACHA">랜덤 아이콘뽑기</option>
                                  
                                    </optgroup>
                                </select>
                            </div>
                            <div className="col">
                                <label className="form-label fw-bold small">등급</label>
                                <select name="pointItemReqLevel" className="form-select" value={input.pointItemReqLevel} onChange={changeInput}>
                                    <option value="일반회원">일반회원</option>
                                    <option value="우수회원">우수회원</option>
                                    <option value="관리자">관리자</option>
                                </select>
                            </div>
                        </div>

                        {/* 희귀도 */}
                        <div className="mb-2">
                            <label className="form-label fw-bold small">구매 제한 (희귀도)</label>
                            <select name="pointItemUniques" className="form-select" value={input.pointItemUniques} onChange={changeInput}>
                                <option value="0">🟢 중복 구매 가능</option>
                                <option value="1">🔴 1회 한정 (중복 불가)</option>
                            </select>
                        </div>

                        {/* 이미지 & 설명 */}
                        <div className="mb-2">
                            <label className="form-label fw-bold small">이미지 URL</label>
                            <input type="text" name="pointItemSrc" value={input.pointItemSrc || ""} className="form-control" onChange={changeInput} />
                        </div>
                        <div className="mb-2">
                            <label className="form-label fw-bold small">설명</label>
                            <textarea name="pointItemContent" value={input.pointItemContent || ""} className="form-control" rows="2" onChange={changeInput}></textarea>
                        </div>

                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>취소</button>
                        <button type="button" className="btn btn-warning fw-bold" onClick={handleEdit}>수정하기</button>
                    </div>
                </div>
            </div>
        </div>
    );
}