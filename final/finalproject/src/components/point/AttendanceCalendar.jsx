import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import moment from "moment";
import axios from "axios";
import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";

const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

export default function AttendanceCalendar({ refreshTrigger }) {
    const loginId = useAtomValue(loginIdState);
    const [markDates, setMarkDates] = useState([]);

    useEffect(() => {
        if (!loginId) return;
        
        // Oracle DB에서 출석 일자 목록을 가져옴
        axios.get("/point/main/attendance/calendar")
            .then(resp => {
                setMarkDates(resp.data || []);
            })
            .catch(err => {
                console.error("출석 데이터 로드 실패:", err);
            });
            
    }, [loginId, refreshTrigger]); 

    return (
        <Calendar
            className="custom-calendar"
            locale="ko-KR"
            calendarType="gregory"
            formatShortWeekday={(locale, date) => weekDays[date.getDay()]}
            formatDay={(locale, date) => moment(date).format("D")}
            tileContent={({ date, view }) => {
                // 특정 날짜에 출석 기록이 있으면 도장 출력
                if (view === "month" && markDates.includes(moment(date).format("YYYY-MM-DD"))) {
                    return <div className="small-stamp">참잘<br/>했어요</div>;
                }
            }}
            next2Label={null} 
            prev2Label={null}
            showNeighboringMonth={false}
        />
    );
}