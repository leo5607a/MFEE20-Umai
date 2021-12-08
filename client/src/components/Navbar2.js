/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PUBLIC_URL } from "../config/config";
import { numDotFormat } from "../config/formula";
import OrderService from "../services/order.service";

import { GoSearch } from "react-icons/go";
import { MdShoppingCart } from "react-icons/md";
import { ImCross } from "react-icons/im";

import UmaiLogo from "./images/Umai.png";
import avatar from "./images/avatar.svg";

import Swal from "sweetalert2";
import CartCourse from "./Navbar/CartCourse";
import { empty } from "statuses";
import getValidMessage from "../validMessage/validMessage";
import axios from "axios";

const Navbar = (props) => {
  let {
    handleLoginClick,
    currentUser,
    isActiveCourseSearch,
    handleToggleCourseSearch,
    cartCourseInfoList,
    setCartCourseInfoList,
    checkoutCourse,
    setCheckoutCourse,
    newAddCourse,
    setNewAddCourse,
    clearNewAddCourse,
    sumCartCoursePrice,
    setSumCartCoursePrice,
    getSumCartCoursePrice,
    handleSumPriceZeroing,
    addCourseIntoCart,
    refreshCartCourse,
    ifNoCourseInCart,
    handleIfCourseInCart,
  } = props;

  const [active, setActive] = useState("");
  useEffect(() => {
    window.addEventListener("scroll", (e) => {
      if (window.scrollY >= 200) {
        setActive(true);
      } else {
        setActive("");
      }
    });

    // 點擊任意處關閉搜尋容器
    window.addEventListener("click", () => {
      handleToggleCourseSearch("close");
    });
  }, []);

  //課程分類左
  const CourseCategoryListLeft = ["日式料理", "法式料理", "中式料理"];
  //課程分類右
  const CourseCategoryListRight = ["韓式料理", "義式料理", "經典調飲"];

  //體驗分享左
  const ExperienceShareListLeft = ["故事牆"];
  //體驗分享右
  const ExperienceShareListRight = ["討論區"];

  // 錯誤訊息
  const [errorMsg, setErrorMsg] = useState("");
  // 判斷購物車中是否只有一堂課
  const [isOnlyCourseInCart, setIsOnlyCourseInCart] = useState(false);

  //搜尋內容
  const SearchKeywordTagList = [
    "創意壽司",
    "義大利麵",
    "紅酒燉牛肉",
    "獵人燉雞",
  ];

  //儲存購物車的課程資訊
  [cartCourseInfoList, setCartCourseInfoList] = useState([]);

  const [searchValue, setSearchValue] = useState("");
  const [SearchCourseList, setSearchCourseList] = useState([]);

  const [checkoutList, setCheckoutList] = useState("");

  useEffect(async () => {
    if (searchValue === "") {
      setSearchCourseList([]);
      return;
    }

    let result = await axios.post(
      "http://localhost:8080/api/course/searchcourse",
      { searchValue: searchValue },
      {
        withCredentials: true,
      }
    );
    setSearchCourseList(result.data.course);
  }, [searchValue]);

  //刪除搜尋內容
  async function handleSearchValueDelete() {
    setSearchValue("");
  }

  //確認購物車是否只有一堂課程
  function ifOnlyCourseInCart() {
    cartCourseInfoList && cartCourseInfoList.length === 1
      ? setIsOnlyCourseInCart(true)
      : setIsOnlyCourseInCart(false);
  }

  //確認結帳時購物車是否只有一堂課程，並跳出通知提醒
  async function ifOnlyCourseInAlert() {
    //確認購物車是否只有一堂課程
    ifOnlyCourseInCart();

    if (!isOnlyCourseInCart) {
      Swal.fire({
        title: "請確認購買數量是否正確!",
        icon: "warning",
        // customClass: "Custom_Cancel",
        confirmButtonColor: "#0078b3",
        confirmButtonText: "確認",
      });
      return;
    }

    //設定結帳課程資訊
    setCheckoutList({
      member_id: cartCourseInfoList[0].member_id,
      course_id: cartCourseInfoList[0].course_id,
      cartCourseCount: cartCourseInfoList[0].cartCourseCount,
    });

    // 結帳資料送後端
    try {
      let result = await OrderService.checkout(
        checkoutList.member_id,
        checkoutList.course_id
      );

      // 刪除錯誤訊息
      setErrorMsg("");
    } catch (error) {
      // console.log(error.response);
      let { code } = error.response.data;
      setErrorMsg(getValidMessage("cart", code));
    }
  }

  // 確認是否登入，並提醒要登入才能買課程
  async function ifLogIn() {
    if (currentUser === null) {
      return Swal.fire({
        title: getValidMessage("cart", "D001"),
        icon: "warning",
        confirmButtonColor: "#0078B3",
        confirmButtonText: "確認",
        timer: 1500,
      });
    }
    // 沒登入無法結帳(離開結帳判斷)
    if (currentUser === null) return;
  }

  // 結帳按鈕判斷
  const handleCheckout = async () => {
    //清空結帳資訊
    setCheckoutCourse({});

    // 確認是否登入，並提醒要登入才能買課程
    ifLogIn();

    //確認結帳時購物車是否只有一堂課程，並跳出通知提醒
    ifOnlyCourseInAlert();

    //設定結帳資訊
    setCheckoutCourse({
      member_id:
        cartCourseInfoList && cartCourseInfoList.length === 1
          ? cartCourseInfoList.member_id
          : undefined,
      course_id:
        cartCourseInfoList && cartCourseInfoList.length === 1
          ? cartCourseInfoList.course_id
          : undefined,
      batch_id:
        cartCourseInfoList && cartCourseInfoList.length === 1
          ? cartCourseInfoList.batch_id
          : undefined,
      cartCourseCount:
        cartCourseInfoList && cartCourseInfoList.length === 1
          ? cartCourseInfoList.cartCourseCount
          : 1,
    });
    if (
      checkoutCourse.member_id === undefined ||
      checkoutCourse.course_id === undefined ||
      checkoutCourse.batch_id === undefined
    ) {
      return;
    } else {
      return (window.location.href = "http://localhost:3000/ShoppingCart");
    }
  };

  // 控制購物車容器開合
  const [cartConOpen, setCartConOpen] = useState(false);
  const handleCartConOpen = () => {
    // console.log("in");
    setCartConOpen(true);
  };
  const handleCartConClose = () => {
    // console.log("out");
    setCartConOpen(false);
  };

  //頁面初次渲染、課程加入購物車、課程報名數量改變時，即時更新金額
  useEffect(() => {
    console.log("觸發navbar2");
    console.log(newAddCourse);
    if (newAddCourse.length === 1) {
      let newCartCourseInfoList = [newAddCourse[0]];
      setCartCourseInfoList(newCartCourseInfoList);
      console.log("newAddCourse.length-1");
      console.log(newCartCourseInfoList);
    }

    if (newAddCourse.length === 2) {
      // console.log(cartCourseInfoList[0].cartCourseCount);
      let newCartCourseInfoList = [newAddCourse[0]];
      newCartCourseInfoList = newCartCourseInfoList.map((obj) => {
        if (obj.course_id === newAddCourse[0].course_id) {
          obj.cartCourseCount = obj.cartCourseCount + 1;
        }
        return obj;
      });
      console.log("newAddCourse.length-2");
      console.log(newCartCourseInfoList);
      console.log(newCartCourseInfoList[0].cartCourseCount);
      setCartCourseInfoList([{ ...newCartCourseInfoList[0] }]);
      console.log([{ ...newCartCourseInfoList[0] }]);
    }
    console.log("cartCourseInfoList");
    // 重新整理購物車資訊、計算總金額，並刪除購物車中數量小於0的課程
    refreshCartCourse();
  }, [newAddCourse]);

  //頁面初次渲染、課程加入購物車、課程報名數量改變時，即時更新金額
  useEffect(() => {
    //清空新增課程state
    clearNewAddCourse();

    // 重新整理購物車資訊、計算總金額，並刪除購物車中數量小於0的課程
    refreshCartCourse();

    //判斷購物車是否只有一堂課程
    ifOnlyCourseInCart();

    //當購物車沒課程時，改變狀態判斷
    handleIfCourseInCart();

    //當購物車沒課程時，將總金額歸零
    handleSumPriceZeroing();
  }, []);

  useEffect(() => {
    // //判斷購物車是否只有一堂課程
    // ifOnlyCourseInCart();
    // //當購物車沒課程時，改變狀態判斷
    // handleIfCourseInCart();
    // //當購物車沒課程時，將總金額歸零
    // handleSumPriceZeroing();
  }, [cartCourseInfoList]);

  return (
    <div className="Header">
      <div className={`Navbar ${active ? "Navbar-active" : ""}`}>
        <div className="Navbar-container">
          <div className="Navbar-container-item ">
            {/* Logo */}
            <div className="Navbar-container-item-container Navbar-container-item-container-UmaiLogo">
              <Link to="/">
                <img src={UmaiLogo} alt="Umai Logo" className="UmaiLogo" />
              </Link>
            </div>

            {/* 課程探索 */}
            <div className="Navbar-container-item-container">
              <button
                className="Navbar-container-item-btn Navbar-container-item-CourseDiscover Navbar-container-item-CourseSearch"
                //  12/4 亭
                onClick={() => {
                  window.location.href =
                    "http://localhost:3000/courses/category?all";
                }}
              >
                課程探索
              </button>
              {/* 下拉式選單 */}
              {/* <div className="Navbar-container-item-CourseDiscover-dropdown-hoverZone"></div> */}
              <div className="Navbar-container-item-CourseDiscover-dropdown">
                <ul>
                  {CourseCategoryListLeft.map((cate) => (
                    <li
                      //  12/4 亭
                      onClick={() => {
                        window.location.href =
                          "http://localhost:3000/courses/category?" + `${cate}`;
                      }}
                    >
                      {cate}
                    </li>
                  ))}
                </ul>
                <ul>
                  {CourseCategoryListRight.map((cate) => (
                    <li
                      //  12/4 亭
                      onClick={() => {
                        window.location.href =
                          "http://localhost:3000/courses/category?" + `${cate}`;
                      }}
                    >
                      {cate}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 體驗分享 */}
            <div className="Navbar-container-item-container">
              <button
                className="Navbar-container-item-btn Navbar-container-item-ExperienceShare"
                onClick={() => {
                  console.log(cartCourseInfoList);
                }}
              >
                體驗分享
              </button>
              {/* 下拉式選單 */}
              {/* <div className="Navbar-container-item-ExperienceShare-dropdown-hoverZone"></div> */}
              <div className="Navbar-container-item-ExperienceShare-dropdown">
                <ul>
                  {ExperienceShareListLeft.map((page) => (
                    <li
                      onClick={() => {
                        window.location.href = "http://localhost:3000/forum";
                      }}
                    >
                      {page}
                    </li>
                  ))}
                </ul>
                <ul>
                  {ExperienceShareListRight.map((page) => (
                    <li
                      onClick={() => {
                        window.location.href = "http://localhost:3000/forum";
                      }}
                    >
                      {page}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 尋找課程 */}
            <div className="Navbar-container-item-container">
              <button
                className="Navbar-container-item-btn Navbar-container-item-CourseSearch"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleCourseSearch();
                }}
              >
                <GoSearch />
                &ensp;尋找課程
              </button>
            </div>
          </div>

          {/* 購物車與會員中心(已登入) */}
          {currentUser && (
            <div className="Navbar-container-item">
              <div className="Navbar-container-item-container2">
                {/* 購物車按鈕 */}
                <button
                  className="Navbar-container-item-btn2 Navbar-container-item-Cart"
                  onMouseEnter={handleCartConOpen}
                  onMouseLeave={handleCartConClose}
                >
                  <MdShoppingCart className="Navbar-container-item-btn2-Cart" />
                </button>
                {/* 會員中心按鈕 */}
                <Link
                  to="/memberCenter"
                  className="Navbar-container-item-btn Navbar-container-item-btn2"
                >
                  {/* 會員已登入且有大頭貼 */}
                  {currentUser && currentUser.avatar && (
                    <img
                      src={`${PUBLIC_URL}/upload-images/${currentUser.avatar}`}
                      alt="使用者頭貼"
                      className="Navbar-container-item-btn Navbar-container-item-btn2-avatar"
                    />
                  )}
                  {/* 會員已登入但沒有大頭貼 */}
                  {currentUser && !currentUser.avatar && (
                    <img
                      src={avatar}
                      alt="使用者頭貼"
                      className="Navbar-container-item-btn Navbar-container-item-btn2-avatar"
                    />
                  )}
                </Link>

                {/* 購物車框框 */}
                <div
                  className={`Navbar-container-item-Cart-dropdown ${
                    cartConOpen
                      ? "Navbar-container-item-Cart-dropdown-active"
                      : ""
                  }`}
                >
                  <div className="Navbar-container-item-Cart-dropdown-container">
                    {/* 購物車課程卡片 */}
                    {!ifNoCourseInCart &&
                      cartCourseInfoList?.map((Obj) => {
                        return (
                          Obj && (
                            <CartCourse
                              index={cartCourseInfoList.indexOf(Obj)}
                              currentUser={currentUser}
                              CurrentInfoObject={Obj}
                              cartCourseInfoList={cartCourseInfoList}
                              setCartCourseInfoList={setCartCourseInfoList}
                              sumCartCoursePrice={sumCartCoursePrice}
                              setSumCartCoursePrice={setSumCartCoursePrice}
                              getSumCartCoursePrice={getSumCartCoursePrice}
                              handleSumPriceZeroing={handleSumPriceZeroing}
                              addCourseIntoCart={addCourseIntoCart}
                              refreshCartCourse={refreshCartCourse}
                              ifNoCourseInCart={ifNoCourseInCart}
                            />
                          )
                        );
                      })}
                    {ifNoCourseInCart && (
                      <div className="CartCourse-container-empty">
                        <h5>快去選購更多精彩課程！</h5>
                      </div>
                    )}

                    {/* 購物車資訊與結帳按鈕 容器 */}
                    <div className="Navbar-container-item-Cart-dropdown-info-bottom">
                      <div className="Navbar-container-item-Cart-dropdown-info-bottom-left">
                        {/* 課程數量 */}
                        <div className="sumCourse">
                          <p>
                            總計{" "}
                            {cartCourseInfoList === []
                              ? 0
                              : cartCourseInfoList?.length}{" "}
                            堂課
                          </p>
                        </div>
                        {/* 當前購物車總金額 */}
                        <div className="sumPrice">
                          <h5>NT$ {sumCartCoursePrice}</h5>
                        </div>
                        <div className="Navbar-container-item-Cart-dropdown-info-bottom-right">
                          {/* 結帳按鈕 */}
                          <div
                            className="goCheckOut"
                            onClick={() => {
                              handleCheckout();
                            }}
                          >
                            <h5>前往結帳</h5>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 購物車與會員中心(未登入) */}
          {!currentUser && (
            <div className="Navbar-container-item">
              <div className="Navbar-container-item-container2">
                {/* 購物車按鈕 */}
                <button
                  className="Navbar-container-item-btn2 Navbar-container-item-Cart"
                  onMouseEnter={handleCartConOpen}
                  onMouseLeave={handleCartConClose}
                >
                  <MdShoppingCart className="Navbar-container-item-btn2-Cart" />
                </button>
                &thinsp;
                {/* 會員登入註冊按鈕 */}
                <button
                  onClick={handleLoginClick}
                  className="Navbar-container-item-btn Navbar-container-item-btn-login"
                >
                  登入
                </button>
                {/* 購物車框框 */}
                <div
                  className={`Navbar-container-item-Cart-dropdown ${
                    cartConOpen
                      ? "Navbar-container-item-Cart-dropdown-active"
                      : ""
                  }`}
                >
                  <div className="Navbar-container-item-Cart-dropdown-container">
                    {/* 購物車課程卡片 */}
                    {!ifNoCourseInCart &&
                      cartCourseInfoList?.map((Obj) => {
                        return (
                          Obj && (
                            <CartCourse
                              index={cartCourseInfoList.indexOf(Obj)}
                              currentUser={currentUser}
                              CurrentInfoObject={Obj}
                              cartCourseInfoList={cartCourseInfoList}
                              setCartCourseInfoList={setCartCourseInfoList}
                              sumCartCoursePrice={sumCartCoursePrice}
                              setSumCartCoursePrice={setSumCartCoursePrice}
                              getSumCartCoursePrice={getSumCartCoursePrice}
                              handleSumPriceZeroing={handleSumPriceZeroing}
                              addCourseIntoCart={addCourseIntoCart}
                              refreshCartCourse={refreshCartCourse}
                              ifNoCourseInCart={ifNoCourseInCart}
                            />
                          )
                        );
                      })}
                    {ifNoCourseInCart && (
                      <div className="CartCourse-container-empty">
                        <h5>快去選購更多精彩課程！</h5>
                      </div>
                    )}

                    {/* 購物車資訊與結帳按鈕 容器 */}
                    <div className="Navbar-container-item-Cart-dropdown-info-bottom">
                      <div className="Navbar-container-item-Cart-dropdown-info-bottom-left">
                        {/* 課程數量 */}
                        <div className="sumCourse">
                          <p>
                            總計{" "}
                            {cartCourseInfoList === []
                              ? 0
                              : cartCourseInfoList?.length}{" "}
                            堂課
                          </p>
                        </div>
                        {/* 當前購物車總金額 */}
                        <div className="sumPrice">
                          <h5>NT$ {sumCartCoursePrice}</h5>
                        </div>
                        <div className="Navbar-container-item-Cart-dropdown-info-bottom-right">
                          {/* 結帳按鈕 */}
                          <div
                            className="goCheckOut"
                            onClick={() => {
                              ifLogIn();
                            }}
                          >
                            <h5>前往結帳</h5>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 課程searchbar */}
      {!isActiveCourseSearch ? (
        <div className="Navbar-CourseSearch">
          <div
            className="Navbar-CourseSearch-container"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="Navbar-CourseSearch-dropdown">
              <input
                type="text"
                className="Navbar-CourseSearch-dropdown-SearchBar"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                }}
              />
              <button
                className="SearchBar-cross-circle"
                onClick={handleSearchValueDelete}
              >
                <ImCross className="SearchBar-cross-icon" />
              </button>
            </div>
            <div className="SearchKeywordTag">
              <span>推薦關鍵字：</span>
              {SearchKeywordTagList.map((keywordTag) => (
                <div
                  className="KeywordTag"
                  title={keywordTag}
                  onClick={(e) => {
                    setSearchValue(e.target.title);
                  }}
                >
                  #{keywordTag}
                </div>
              ))}
            </div>
            <div className="SearchCourseList">
              {SearchCourseList.map((Course, i) => {
                if (i <= 4)
                  return (
                    <div
                      className="recommandCourse"
                      title={Course.course_name}
                      onClick={(e) => {
                        window.location.href = `http://localhost:3000/courses/${Course.id}`;
                      }}
                    >
                      {Course.course_name}
                    </div>
                  );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
export default Navbar;
