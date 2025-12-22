import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import "./AdminStore.css";

export default function AdminStore() {
    const [items, setItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const fallbackImage = "https://via.placeholder.com/100?text=No+Image";

    const [formData, setFormData] = useState({
        pointItemNo: 0,
        pointItemName: "",
        pointItemPrice: 0,
        pointItemStock: 0,
        pointItemType: "DECO_FRAME",
        pointItemReqLevel: "일반회원",
        pointItemContent: "",
        pointItemSrc: "",
        pointItemIsLimitedPurchase: 0,
        pointItemDailyLimit: 0
    });

    const loadItems = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get("/admin/store/list"); 
            setItems(res.data);
        } catch (err) {
            console.error("아이템 목록 로드 실패", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            pointItemPrice: Number(formData.pointItemPrice),
            pointItemStock: Number(formData.pointItemStock),
            pointItemDailyLimit: Number(formData.pointItemDailyLimit),
            pointItemIsLimitedPurchase: Number(formData.pointItemIsLimitedPurchase)
        };

        const isEdit = formData.pointItemNo > 0;
        const url = isEdit ? "/point/main/store/item/edit" : "/point/main/store/item/add";

        try {
            await axios.post(url, payload);
            Swal.fire({ title: isEdit ? '수정 완료' : '등록 완료', icon: 'success', background: '#1a1a1a', color: '#fff' });
            setShowModal(false);
            loadItems();
        } catch (err) {
            Swal.fire({ title: '처리 실패', text: '데이터 형식을 확인해주세요.', icon: 'error', background: '#1a1a1a', color: '#fff' });
        }
    };

    const handleDelete = async (pointItemNo) => {
        const result = await Swal.fire({
            title: '아이템 삭제',
            text: "정말 삭제하시겠습니까?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '삭제',
            background: '#1a1a1a', color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/admin/store/delete/${pointItemNo}`);
                Swal.fire({ title: '삭제됨', icon: 'success', background: '#1a1a1a', color: '#fff' });
                loadItems();
            } catch (err) {
                Swal.fire({ title: '삭제 실패', icon: 'error', background: '#1a1a1a', color: '#fff' });
            }
        }
    };

    const openAddModal = () => {
        setFormData({ 
            pointItemNo: 0, pointItemName: "", pointItemPrice: 0, pointItemStock: 0, 
            pointItemType: "DECO_FRAME", pointItemReqLevel: "일반회원", pointItemContent: "", 
            pointItemSrc: "", pointItemIsLimitedPurchase: 0, pointItemDailyLimit: 0 
        });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setFormData({
            ...item,
            pointItemDailyLimit: Number(item.pointItemDailyLimit || 0),
            pointItemIsLimitedPurchase: Number(item.pointItemIsLimitedPurchase || 0)
        });
        setShowModal(true);
    };

    return (
        <div className="as-container">
            <header className="as-header">
                <h1>STORE ADMIN <span className="as-subtitle">상품 관리 시스템</span></h1>
                <button className="as-btn-add-main" onClick={openAddModal}>+ 새 상품 등록</button>
            </header>

            <div className="as-table-wrapper">
                <table className="as-item-table">
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>미리보기</th>
                            <th>유형/이름</th>
                            <th>가격/재고</th>
                            <th>구매제한</th>
                            <th>액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.pointItemNo}>
                                <td>{item.pointItemNo}</td>
                                <td>
                                    <div className={`as-list-img-box as-type-${item.pointItemType}`}>
                                        <img 
                                            src={item.pointItemSrc || fallbackImage} 
                                            alt="item" 
                                            onError={(e) => { e.target.src = fallbackImage; }}
                                        />
                                    </div>
                                </td>
                                <td>
                                    <span className={`as-item-badge as-badge-${item.pointItemType}`}>{item.pointItemType}</span>
                                    <div className="as-font-bold as-mt-1">{item.pointItemName}</div>
                                </td>
                                <td>
                                    <div className="as-text-gold">{item.pointItemPrice?.toLocaleString()} P</div>
                                    <div className="as-text-muted-small">재고: {item.pointItemStock}</div>
                                </td>
                                <td>
                                    {item.pointItemIsLimitedPurchase === 1 ? '1회 한정' : '제한없음'}
                                    <div className="as-text-danger-small">일일: {item.pointItemDailyLimit}회</div>
                                </td>
                                <td>
                                    <div className="as-action-btns">
                                        <button className="as-btn-sm as-btn-edit" onClick={() => openEditModal(item)}>수정</button>
                                        <button className="as-btn-sm as-btn-delete" onClick={() => handleDelete(item.pointItemNo)}>삭제</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="as-modal-overlay">
                    <div className="as-modal-content">
                        <h2>{formData.pointItemNo ? `상품 수정 (No.${formData.pointItemNo})` : '신규 상품 등록'}</h2>
                        <form onSubmit={handleSave}>
                            <div className="as-modal-preview-section">
                                <div className="as-modal-img-display">
                                    <img 
                                        src={formData.pointItemSrc || fallbackImage} 
                                        alt="미리보기" 
                                        onError={(e) => { e.target.src = fallbackImage; }}
                                    />
                                </div>
                                <div className="as-modal-img-info">
                                    <label>이미지 경로 (URL)</label>
                                    <input 
                                        name="pointItemSrc" 
                                        className="as-input-field"
                                        value={formData.pointItemSrc} 
                                        onChange={handleInputChange} 
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="as-form-group">
                                <label>상품명</label>
                                <input className="as-input-field" name="pointItemName" value={formData.pointItemName} onChange={handleInputChange} required />
                            </div>
                            
                            <div className="as-flex-row">
                                <div className="as-form-group as-col-6">
                                    <label>가격 (P)</label>
                                    <input className="as-input-field" type="number" name="pointItemPrice" value={formData.pointItemPrice} onChange={handleInputChange} />
                                </div>
                                <div className="as-form-group as-col-6">
                                    <label>재고</label>
                                    <input className="as-input-field" type="number" name="pointItemStock" value={formData.pointItemStock} onChange={handleInputChange} />
                                </div>
                            </div>

                            <div className="as-flex-row">
                                <div className="as-form-group as-col-6">
                                    <label>아이템 유형</label>
                                    <select className="as-select-field" name="pointItemType" value={formData.pointItemType} onChange={handleInputChange}>
                                        <option value="HEART_RECHARGE">하트 충전권</option>
                                        <option value="DECO_FRAME">프로필 테두리</option>
                                        <option value="DECO_ICON">프로필 아이콘</option>
                                        <option value="CHANGE_NICK">닉네임 변경권</option>
                                        <option value="DECO_BG">프로필 배경</option>
                                    </select>
                                </div>
                                <div className="as-form-group as-col-6">
                                    <label>구매 등급</label>
                                    <select className="as-select-field" name="pointItemReqLevel" value={formData.pointItemReqLevel} onChange={handleInputChange}>
                                        <option value="일반회원">일반회원</option>
                                        <option value="우수회원">우수회원</option>
                                        <option value="관리자">관리자</option>
                                    </select>
                                </div>
                            </div>

                            <div className="as-flex-row">
                                <div className="as-form-group as-col-6">
                                    <label>1인 1회 제한</label>
                                    <select className="as-select-field" name="pointItemIsLimitedPurchase" value={formData.pointItemIsLimitedPurchase} onChange={handleInputChange}>
                                        <option value={0}>N (중복가능)</option>
                                        <option value={1}>Y (1회한정)</option>
                                    </select>
                                </div>
                                <div className="as-form-group as-col-6">
                                    <label>일일 구매 제한</label>
                                    <input className="as-input-field" type="number" name="pointItemDailyLimit" value={formData.pointItemDailyLimit} onChange={handleInputChange} />
                                </div>
                            </div>

                            <div className="as-modal-actions">
                                <button type="button" className="as-btn-cancel" onClick={() => setShowModal(false)}>취소</button>
                                <button type="submit" className="as-btn-save">저장하기</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}