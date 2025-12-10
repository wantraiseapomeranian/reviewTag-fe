import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // 기본 CSS 로드
import moment from "moment";
import axios from "axios";
import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";
import "./PointMain.css"; // 스타일 시트

// 요일 표시 에러 방지용 배열 (일, 월, 화...)
const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

export default function AttendanceCalendar({ refreshTrigger }) {
    const loginId = useAtomValue(loginIdState);
    const [markDates, setMarkDates] = useState([]); // 출석한 날짜 목록 ["2023-12-01", ...]

    // 1. 서버에서 출석 날짜 목록 가져오기
    useEffect(() => {
        if (!loginId) return;
        
        // [백엔드 API 호출] /point/attendance/calendar
        axios.get("/point/main/attendance/calendar")
            .then(resp => {
                // 데이터가 ["2023-12-01", "2023-12-02"] 형태로 온다고 가정
                setMarkDates(resp.data || []);
            })
            .catch(err => console.error("달력 로드 실패:", err));
            
    }, [loginId, refreshTrigger]); // refreshTrigger가 바뀌면(출석 직후) 다시 실행됨

    // 2. 날짜 칸에 도장 찍기 (렌더링 함수)
    function tileContent({ date, view }) {
        // 월 달력 보기(Month View)일 때만 도장 찍음
        if (view === "month") {
            const dateStr = moment(date).format("YYYY-MM-DD");
            
            // 받아온 리스트에 해당 날짜가 있으면 도장 표시
            if (markDates.includes(dateStr)) {
                return (
                    <div className="small-stamp">
                        참잘<br/>했어요
                    </div>
                );
            }
        }
        return null; // 없으면 아무것도 안 그림
    }

    return (
        <div className="bg-white p-4 rounded shadow-sm border attendance-calendar-wrapper">
            <h5 className="fw-bold mb-3 text-secondary">
                📅 <span className="text-dark">나의 출석부</span> (출석 도장을 모아보세요!)
            </h5>
            
            <Calendar
                className="custom-calendar"
                locale="ko-KR"
                calendarType="gregory" // 일요일부터 시작 (최신 버전 호환)
                
                // [에러 방지] 요일 이름을 수동으로 지정
                formatShortWeekday={(locale, date) => weekDays[date.getDay()]}
                
                // 날짜 숫자 포맷 (1일 -> 1)
                formatDay={(locale, date) => moment(date).format("D")}
                
                //  도장 렌더링 함수 연결
                tileContent={tileContent}
                
                // 상단 네비게이션 버튼 (<<, >>) 숨기기 - 깔끔하게
                next2Label={null} 
                prev2Label={null}
                
                // 연도 단위로 너무 축소되지 않게 막음
                minDetail="year"
                
                // 클릭 시 파란 배경 깜빡임 방지
                activeStartDate={null} 
            />
        </div>
    );
}