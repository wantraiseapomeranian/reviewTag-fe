import { useState } from "react";
import axios from "axios";

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
        if (!input.pointItemName || !input.pointItemPrice) return alert("상품명과 가격은 필수입니다.");

        try {
            const resp = await axios.post("/point/store/item/add", input);
            if (resp.data === "success") {
                alert("상품 등록 완료!");
                reload(); // 목록 새로고침
                closeModal(); // 모달 닫기
            } else if (resp.data === "fail_auth") {
                alert("관리자만 등록할 수 있습니다.");
            } else {
                alert("등록 실패");
            }
        } catch (e) {
            alert("서버 오류가 발생했습니다.");
            console.error(e);
        }
    };

    return (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">📦 신규 상품 등록</h5>
                        <button type="button" className="btn-close" onClick={closeModal}></button>
                    </div>
                    <div className="modal-body">
                        
                        {/* 상품명 */}
                        <div className="mb-2">
                            <label className="form-label">상품명</label>
                            <input type="text" name="pointItemName" className="form-control" onChange={changeInput} />
                        </div>

                        {/* 가격 & 재고 */}
                        <div className="row mb-2">
                            <div className="col">
                                <label className="form-label">가격(P)</label>
                                <input type="number" name="pointItemPrice" className="form-control" onChange={changeInput} />
                            </div>
                            <div className="col">
                                <label className="form-label">재고</label>
                                <input type="number" name="pointItemStock" className="form-control" value={input.pointItemStock} onChange={changeInput} />
                            </div>
                        </div>

                        {/* 유형 & 등급 */}
                        <div className="row mb-2">
                            <div className="col">
                                <label className="form-label">유형</label>
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
                                    <option value="RANDOM">랜덤 박스</option>
                                </select>
                            </div>
                            <div className="col">
                                <label className="form-label">필요 등급</label>
                                <select name="pointItemReqLevel" className="form-select" onChange={changeInput} value={input.pointItemReqLevel}>
                                    <option value="일반회원">일반회원</option>
                                    <option value="우수회원">우수회원</option>
                                    <option value="관리자">관리자</option>
                                </select>
                            </div>
                        </div>

                        {/* ★ 희귀도 (중복 구매 설정) 추가됨 ★ */}
                        <div className="mb-2">
                            <label className="form-label">구매 제한 (희귀도)</label>
                            <select name="pointItemUniques" className="form-select" onChange={changeInput} value={input.pointItemUniques}>
                                <option value="0">🟢 중복 구매 가능 (여러 개 소지 가능)</option>
                                <option value="1">🔴 중복 구매 불가 (1인당 1개 한정)</option>
                            </select>
                        </div>

                        {/* 이미지 & 설명 */}
                        <div className="mb-2">
                            <label className="form-label">이미지 URL</label>
                            <input type="text" name="pointItemSrc" className="form-control" placeholder="http://..." onChange={changeInput} />
                        </div>
                        <div className="mb-2">
                            <label className="form-label">설명</label>
                            <textarea name="pointItemContent" className="form-control" rows="2" onChange={changeInput}></textarea>
                        </div>

                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>취소</button>
                        <button type="button" className="btn btn-primary" onClick={handleAdd}>등록하기</button>
                    </div>
                </div>
            </div>
        </div>
    );
}