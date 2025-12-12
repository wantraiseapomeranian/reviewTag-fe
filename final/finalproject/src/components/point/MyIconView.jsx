import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function MyIconView({ refreshPoint }) {
    const [myIcons, setMyIcons] = useState([]);

    const loadMyIcons = async () => {
        try {
            const resp = await axios.get("/point/icon/my");
            setMyIcons(resp.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { loadMyIcons(); }, []);

    const handleEquip = async (icon) => {
        // [수정 1] 이미 장착된 아이콘 클릭 시 안내 메시지
        if (icon.isEquipped === 'Y') {
            toast.info("이미 장착중인 아이콘입니다. ⭐");
            return;
        }

        if(!window.confirm(`[${icon.iconName}] 아이콘을 장착하시겠습니까?`)) return;
        
        try {
            await axios.post("/point/icon/equip", { iconId: icon.memberIconIcon }); 
            toast.success("아이콘이 적용되었습니다! 😎");
            loadMyIcons(); 
            if(refreshPoint) refreshPoint();
        } catch(e) { 
            toast.error("장착 실패"); 
        }
    };

    const handleUnequip = async () => {
        if(!window.confirm("현재 아이콘을 해제하시겠습니까?")) return;
        try {
            await axios.post("/point/icon/unequip");
            toast.info("기본 상태로 돌아왔습니다.");
            loadMyIcons(); 
            if(refreshPoint) refreshPoint(); 
        } catch(e) { toast.error("해제 실패"); }
    };

    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">🦸 내 이모티콘 보관함</h5>
                <button className="btn btn-sm btn-outline-secondary" onClick={handleUnequip}>
                    장착 해제
                </button>
            </div>

            {myIcons.length === 0 ? (
                <div className="text-center py-5 bg-light rounded text-muted">
                    보유한 아이콘이 없습니다.<br/>상점에서 뽑기를 진행해보세요! 🎲
                </div>
            ) : (
                <div className="row g-3">
                    {myIcons.map((item) => {
                        const isEquipped = item.isEquipped === 'Y';

                        return (
                            <div className="col-4 col-sm-3 col-md-2 text-center" key={item.memberIconId}>
                                <div 
                                    className={`card h-100 shadow-sm icon-card ${isEquipped ? 'border-primary border-3 bg-light' : 'border-0'}`}
                                    style={{cursor: 'pointer', transition: 'transform 0.2s'}}
                                    onClick={() => handleEquip(item)}
                                    onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                                    onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                                >
                                    {/* 장착중 뱃지 */}
                                    {isEquipped && (
                                        <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-primary shadow-sm" style={{fontSize:'0.7rem', zIndex: 1}}>
                                            장착중
                                        </span>
                                    )}

                                    <div className="card-body p-2 d-flex flex-column align-items-center justify-content-center">
                                        <img 
                                            src={item.iconSrc} 
                                            className="mb-2" 
                                            style={{width: '50px', height: '50px', objectFit: 'contain'}} 
                                            alt={item.iconName}
                                            // 이미지 깨짐 방지
                                            onError={(e)=>{e.target.src='https://placehold.co/50x50?text=IMG'}} 
                                        />
                                        
                                        {/* [수정 2] 등급 표시 (EVENT 추가됨) */}
                                        <span className={`badge mb-1 ${
                                            item.iconRarity==='LEGENDARY' ? 'bg-warning text-dark border border-dark' :
                                            item.iconRarity==='UNIQUE'    ? 'bg-purple text-white' :
                                            item.iconRarity==='EPIC'      ? 'bg-danger' :
                                            item.iconRarity==='RARE'      ? 'bg-primary' :
                                            item.iconRarity==='EVENT'     ? 'bg-event' : /* ★ EVENT 추가 */
                                            'bg-secondary'
                                        }`} style={{fontSize:'0.6rem'}}>
                                            {item.iconRarity}
                                        </span>
                                        
                                        <small className="text-dark fw-bold text-truncate w-100" style={{fontSize: '0.75rem'}}>
                                            {item.iconName}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}