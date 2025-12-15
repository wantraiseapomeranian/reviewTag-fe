import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";



export default function boardInsert(){
    // 통합 state
    const loginId = useAtomValue(loginIdState);
    //도구
    const navigate = useNavigate();
    //state
    const [board, setBoard] = useState({
        boardTitle : "" , boardText : "", boardNotice : "N",
        boardContentsId : "", boardWriter : ""
    });
    const [boardClass, setBoardClass] = useState({
        boardTitle : "" , boardText : "", boardNotice : "",
        boardContentsId : ""
    })

    //effect
    useEffect(()=>{
        if(loginId){
            setBoard(prev=>({...prev, boardWriter : loginId}));
        }
    },[loginId])


    // callback
    const changeStrValue = useCallback(e=>{
        const {name, value} = e.target;
        setBoard(prev=>({...prev, [name]:value}))
    },[])

        // callback
    const changeCheckValue = useCallback(e=>{
        if(e.target.value !== "on") return;
        setBoard(prev=>({...prev, boardNotice : "Y"}))
    },[])

    //  제목
    const checkBoardTitle = useCallback(e=>{
        const valid = board.boardTitle.length > 0;
        setBoardClass({...boardClass, boardTitle : valid ? "is-valid" : "is-invalid"});
    },[board, boardClass])
    // 내용
    const checkBoardText = useCallback(e=>{
        const valid = board.boardText.length > 0;
        setBoardClass({...boardClass, boardText : valid ? "is-valid" : "is-invalid"});
    },[board, boardClass])

    // 공지등록


    //콘텐츠번호



    const boardValid = useMemo(()=>{
        if(boardClass.boardTitle !== "is-valid" ) return false;
        if(boardClass.boardText !== "is-valid" ) return false;
        // if(boardClass.boardContentsId !== "is-valid" ) return false;
        return true;
    },[boardClass]);

    // 등록
    const sendData = useCallback(async()=>{
        if(boardValid===false) return;
        const {data} = await axios.post("/board/",board);
        navigate("/board/list");  
    })



    //render
    return (<>
        <h1> 게시글 등록 </h1>

        <div className="row mt-2">
            <div className="col">
                <label>제목</label>
                <input type="text" className="col-form-label" name="boardTitle" onChange={changeStrValue}
                    onBlur = {checkBoardTitle}></input>
            </div>
        </div>
        <div className="row mt-2">
            <div className="col">
                <label>콘텐츠 번호</label>
                <input type="text" className="col-form-label" name="boardContentsId"  onChange={changeStrValue}></input>
            </div>
        </div>
        <div className="row mt-2">
            <div className="col">
                <label>내용</label>
                <input type="text" className="col-form-label" name="boardText"  onChange={changeStrValue}
                    onBlur={checkBoardText}></input>
            </div>
        </div>
        <div className="row mt-2">
            <div className="col">
                <label>공지등록</label>
                <input type="checkbox" className="col-form-label" name="boardNotice" onChange={changeCheckValue}></input>
            </div>
        </div>

        <div className="row mt-4">
            <div className="col">
                <button type="button" className="btn btn-lg btn-success w-100" disabled={boardValid === false}
                    onClick={sendData}>
                    <span>작성</span>
                </button>
            </div>
        </div>
    </>)
}