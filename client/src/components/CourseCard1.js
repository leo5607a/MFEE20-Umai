import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoLocationSharp } from "react-icons/io5";
import { GiCook } from "react-icons/gi";
import { FaRegHeart } from "react-icons/fa";
import Button from "./Button";
import StarGroup from "./StarGroup";
import { PUBLIC_URL } from "../config/config";
import { numDotFormat } from "../config/formula";

// 判斷三個不同階級
let leverArray = ["", "高階", "中階", "初階"];
// 判斷當前課程是否為前一天以內新增的
let newCourseCompare = new Date(Date.now() - 86400000);

// 以下為必要props
// courseDetail(課程詳細資料)
// handleAddIntoCollection => 按下愛心 會回傳當前課程id
// handleAddIntoCart => 加入購物車 回傳當前課程id
// handlePurchase => 立即購買 回傳當前課程id

// 下面為非必要props
// collectionIds = 當前登入的使用者收藏的所有課程ID array, 有登入的時候再傳進來即可
const CourseCard1 = (props) => {
  let {
    courseDetail,
    collectionIds,
    handleAddIntoCollection,
    handleAddIntoCart,
    handlePurchase,
    className,
  } = props;

  // 當前課程人數限制
  const [memberLimit, setMemberLimit] = useState("0");
  // 當前最近梯次的報名人數
  const [member, setMember] = useState("0");
  // 當前課程是否被當前登入的使用者加入收藏
  const [isCollection, setIsCollection] = useState("");
  // 評分趴數
  const [scorePercent, setScorePercent] = useState(20);
  // 報名趴數
  let assignPersent = (member / memberLimit) * 100;

  const [courseDetail1, setCourseDetail1] = useState("");
  useEffect(() => {
    setCourseDetail1({...courseDetail});
}, [courseDetail]);

  // 初次render做的事情
  useEffect(() => {
    // 將member及memberLimit裝入
    setMemberLimit(courseDetail1.member_limit);
    setMember(
      courseDetail1.closest_batchs && courseDetail1.closest_batchs.member_count
    );

    // 計算評分平均值
    setScorePercent((courseDetail1.score_sum / courseDetail1.score_count) * 20);

    // 此課程是否被當前使用者收藏
    if (collectionIds) {
      let result = "";
      for (let i = 0; i < collectionIds.length; i++) {
        if (collectionIds[i] == courseDetail1.id) {
          result = true;
          break;
        }
      }
      setIsCollection(result);
    }
  }, [collectionIds]);


  
 

  return (
    <>
    {courseDetail1 && (
<div className={`CourseCard1 ${className ? " " + className : ""}`}>
      <div className="CourseCard1-imageCon">
        <img
          src={`${PUBLIC_URL}/upload-images/${courseDetail1.course_image}`}
          alt="course_image"
        />
        {assignPersent > 80 && (
          <div className="CourseCard1-imageCon-banner">即將截止</div>
        )}
        {new Date(courseDetail1.created_time) > newCourseCompare && (
          <div className="CourseCard1-imageCon-banner">最新課程</div>
        )}
      </div>

      <div className="CourseCard1-detailCon">
        <h4 className="CourseCard1-detailCon-h4">
          <Link to={`/courses/${courseDetail1.id}`}>
            {courseDetail1.course_name}
          </Link>
        </h4>
        <StarGroup
          percent={scorePercent || 0}
          allScore={courseDetail1.score_count || 0}
        />
        <div className="CourseCard1-detailCon-company">
          <IoLocationSharp />
          {courseDetail1.company_name}
          <GiCook />
          {courseDetail1.first_name + " " + courseDetail1.last_name}
        </div>
        <div className="CourseCard1-detailCon-courseTime">
          最近可報名梯次：
          {courseDetail1.closest_batchs
            ? courseDetail1.closest_batchs.batch_date
            : "目前沒有開放"}
        </div>
        <div className="CourseCard1-detailCon-MemberCount">
          <div className="CourseCard1-detailCon-MemberCount-progressCon">
            <div
              className="CourseCard1-detailCon-MemberCount-progress"
              style={{ width: assignPersent + "%" }}
            ></div>
          </div>
          <div>
            報名人數 {member || 0} / {memberLimit}
          </div>
        </div>
        <div className="CourseCard1-detailCon-bottom">
          {/* 這裡要自行判斷當前課程階級，切換className即可改變樣式(highLevel, midLevel, lowLevel) */}
          <div
            className={`CourseCard1-detailCon-bottom-courseLevel highLevel ${
              courseDetail1.course_level == 1
                ? "highLevel"
                : courseDetail1.course_level == 2
                ? "midLevel"
                : "lowLevel"
            }`}
          >
            {leverArray[courseDetail1.course_level]}
          </div>
          <div className="CourseCard1-detailCon-bottom-coursePrice">
            <span className="CourseCard1-detailCon-bottom-coursePrice-origin">
              NT${numDotFormat(courseDetail1.course_price)}
            </span>
            <span className="CourseCard1-detailCon-bottom-coursePrice-discount">
              NT${numDotFormat(courseDetail1.course_price * 0.9)}
            </span>
          </div>
        </div>
        <div
          className={`CourseCard1-detailCon-likeBtn ${
            isCollection && " CourseCard1-detailCon-likeBtn-active"
          }`}
          onClick={() => {
            handleAddIntoCollection(courseDetail1.id);
          }}
        >
          <FaRegHeart />
        </div>
      </div>
      <div className="CourseCard1-buttonCon">
        <Button
          value={"加入購物車"}
          className={"button-themeColor CourseCard1-buttonCon-btn"}
          onClick={() => {
            handleAddIntoCart({
              course_id: courseDetail1.id,
              batch: courseDetail1.closest_batchs,
            });
          }}
        />
        <Button
          value={"立即訂購"}
          className={"button-activeColor CourseCard1-buttonCon-btn"}
          onClick={() => {
            handlePurchase({
              course_id: courseDetail1.id,
              batch: courseDetail1.closest_batchs,
            });
          }}
        />
      </div>
    </div>
    )}
    </>
  );
};

export default CourseCard1;
