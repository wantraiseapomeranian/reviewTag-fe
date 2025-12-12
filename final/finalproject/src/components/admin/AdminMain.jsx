import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import './AdminMain.css'; // 사이드바 스타일

export default function AdminMain() {
    return (
        <div className="d-flex admin-layout-container" style={{ minHeight: '100vh', backgroundColor: '#121212' }}> {/* 전체 배경 어둡게 */}
            
            {/* [왼쪽] 사이드바 */}
            {/* 인라인 스타일 width를 제거하고 CSS 클래스(.admin-sidebar) 적용 */}
            <div className="admin-sidebar p-3 text-white">
                <h4 className="mb-4 fw-bold ps-2 mt-2">🛠️ 관리자</h4>
                
                <div className="list-group list-group-flush">
                    {/* NavLink를 쓰면 현재 URL과 일치할 때 자동으로 'active' 클래스가 붙습니다 */}
                    
                    <NavLink to="/admin/member" className="list-group-item list-group-item-action admin-menu-item">
                        👥 회원 관리
                    </NavLink>
                    
                    <NavLink to="/admin/review" className="list-group-item list-group-item-action admin-menu-item">
                        📝 리뷰 관리
                    </NavLink>
                    
                    <NavLink to="/admin/quiz" className="list-group-item list-group-item-action admin-menu-item">
                        👮‍♀️ 퀴즈 신고 관리
                    </NavLink>
                    
                    <NavLink to="/admin/point" className="list-group-item list-group-item-action admin-menu-item">
                        💰 포인트 관리
                    </NavLink>
                </div>
            </div>

            {/* [오른쪽] 컨텐츠 영역 */}
            <div className="flex-grow-1 p-4 admin-content-dark">
                <div className="container-fluid admin-inner-box p-4 rounded">
                    <Outlet />
                </div>
            </div>

        </div>
    );
}