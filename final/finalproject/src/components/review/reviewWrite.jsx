import { useCallback, useMemo, useState } from "react"
import axios from "axios";
import { toast } from "react-toastify";
import { FaStar } from "react-icons/fa";
import "./review.css";


export default function ReviewWriter() {

    //state
    const [review, setReview] = useState({
        reviewRating: 0,
        reviewSpoiler: "N",
        reviewText: ""
    });

    const [reviewClass, setReviewClass] = useState("");

    const sendData = useCallback(() => {
        if (reviewClassInValid) {
            setReviewClass("is-invalid");
            return;
        }

        if(invalidRating) {
            return;
        }

        axios({
            url: "/review/",
            method: "post",
            data: review
        })
            .then(response => {
                toast.success("등록 완료");
                setReview({
                    reviewRating: 0,
                    reviewSpoiler: "N",
                    reviewText: ""
                });
                setRating(0);
            })
    }, [review])

    const reviewValid = useMemo(() => {
        const regex = /^(?=.*\S).{10,}$/
        return regex.test(review.reviewText);
    }, [review.reviewText])

    const invalidRegex = /([ㄱ-ㅎㅏ-ㅣ])\1{4,}/;
    const reviewClassInValid = useMemo(() => {
        return invalidRegex.test(review.reviewText);
    }, [review.reviewText]);

    const invalidRating = useMemo(() => 
        review.reviewRating < 1, [review.reviewRating]);


    //별점 기능 구현
    const [rating, setRating] = useState(0);
    const [ratingAlert, setRatingAlert] = useState(false);

    const handleStarClick = (num) => {
        setRating(num);  // 클릭한 별 번호로 rating 설정
        setReview(prev => ({
            ...prev,
            reviewRating: num
        }));
    };


    //render
    return (<>
        <div className="row mt-4">
            <div className="col text-center">
                <span>시청하신 콘텐츠는 어떠셨나요?</span><br />
                <span>평점을 남겨주세요</span><br />

                <div className="mt-3" value={review.reviewRating}>
                    {[1, 2, 3, 4, 5].map((num) => (
                        <FaStar
                            key={num}
                            className={num <= rating ? "fullStar" : "emptyStar"}
                            onClick={() => handleStarClick(num)}
                            style={{ cursor: "pointer" }}
                        />
                    ))}
                </div>
            </div>
            <div className="row mt-4">
                <div className="col text-center">
                    <br />
                    <input type="checkbox" className="me-2"
                        checked={review.reviewSpoiler === "Y"}
                        onChange={e => {
                            setReview({
                                ...review,
                                reviewSpoiler: e.target.checked ? "Y" : "N"
                            })
                        }} />
                    <span>감상평에 스포일러가 포함되어있나요?</span><br />
                </div>
            </div>
            <div className="row mt-3 text-center">
                <br />
                <textarea className={`col-8 mx-auto d-block ${reviewClass}`}
                    placeholder="영화와 상관 없는 내용은 약관에 의해 제재를 받을 수 있습니다"
                    value={review.reviewText}
                    onChange={e => {
                        setReview({
                            ...review,
                            reviewText: e.target.value
                        })
                    }}
                    onBlur={() => {
                        setReviewClass(
                            reviewClassInValid ? "is-invalid" : ""
                        );
                    }}
                />
                <div className="invalid-feedback">무의미한 자음/모음의 연속입력은 불가능합니다</div>
            </div>
            <button className="mt-4 btn btn-success d-grid gap-2 col-8 mx-auto"
                disabled={!reviewValid || invalidRating} onClick={sendData}>등록하기</button>
        </div>
    </>)
}