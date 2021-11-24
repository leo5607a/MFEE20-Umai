import React from "react";
import { useState, useEffect } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import {
  AiOutlineMessage,
  AiFillQuestionCircle,
  AiOutlineHeart,
  AiOutlineInstagram,
  AiFillFacebook,
} from "react-icons/ai";
import { BsFillTriangleFill } from "react-icons/bs";
import { Modal, Button, Dropdown } from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../../config/config";

const array = [
  "img1.jpg",
  "img2.jpg",
  "img3.jpg",
  "img4.jpg",
  "img5.jpg",
  "img6.jfif",
  "img7.jpg",
  "img8.jfif",
  "img9.jpg",
  "img10.jfif",
  "確認付款.jpg",
  "付款頁面-01.jpg",
  "結帳頁面1-2-01.jpg",
  "購買頁面-1.1-01-01.jpg",
  "確認付款.jpg",
  "avatar.jpg",
];

const ForumCard = () => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [forumcard, setForumcard] = useState([""]);
  const [articleDetail, setArticleDetail] = useState([""]);

  useEffect(async () => {
    try {
      let res = await axios.get(`${API_URL}/forum`, { withCredentials: true });
      console.log(res);
      setForumcard(res.data.forumdata);
    } catch (error) {
      console.log(error.response);
    }
  }, []);

  return (
    <div>
      <div className="forum">
        <div className="main">
          <h5 className="Forum-main-h3">首頁>討論區</h5>
          <h1 className="Forum-main-h2 ">日式料理</h1>
          <div className="st-line"></div>
          {forumcard &&
            forumcard.map((image) => (
              <div className="Forum-main-out">
                <img
                  className="Forum-main-photo"
                  onClick={handleShow}
                  // src={require(`./../../components/images/${image}`).default}
                  src=""
                  alt="drink"
                ></img>
                <div className="Forum-main-middle">
                  <div className="Forum-main-DateAndDropdown">
                    <p className="Forum-main-date">第五天</p>
                    <div class="Forum-main-dropdown">
                      <FiMoreHorizontal className="FiMoreHorizontal" />
                      <div class="Forum-main-dropdown-content">
                        <p>
                          <a href="#">分享</a>
                        </p>
                        <p>
                          <a href="#">檢舉</a>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="Forum-main-dateAndTheme" onClick={handleShow}>
                    <h5 className="Forum-main-theme" onClick={handleShow}>
                      《築地創意壽司》講師到底好不好？
                    </h5>
                  </div>
                  <p className="Forum-main-p" onClick={handleShow}>
                    這幾天新開的一課程，不知道講師到底怎麼樣？課程費用有點小貴.....不曉得是否有大大可以解惑？覺得想知道.......
                  </p>
                  <div className="Forum-main-little">
                    <AiOutlineHeart className="AiOutlineHeart" />
                    <p className="Forum-main-love">333</p>
                    <AiOutlineMessage className="AiOutlineMessage" />
                    <p className="Forum-main-love">99999</p>
                    <div className="Forum-main-small">
                      <BsFillTriangleFill className="BsFillTriangleFill" />
                      <p>其他功能</p>
                      <a href="#">收藏</a>
                      <a href="#">分享</a>
                      <a href="#">引用</a>
                      <a href="#">檢舉</a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      <Modal
        className="Forum-modal"
        id="style-10"
        size="xl"
        show={show}
        onHide={handleClose}
      >
        <Modal.Header className="Forum-modal-header" closeButton>
          <Modal.Title>
            <h2>築地創意壽司 課程老師評價？</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="Forum-modal-body">
          <div className="Forum-modal-body-border">
            <div className="Forum-modal-body-account">
              <img
                className="Forum-modal-body-account-image"
                src={require(`./../../components/images/img1.jpg`).default}
                alt="cake"
              ></img>

              <div>
                <h6 className="Forum-modal-body-account-name">奇異的小玩偶</h6>
                <h6 className="Forum-modal-body-account-id">
                  @olsonlovesmakelove
                </h6>
              </div>
              <div className="Forum-main-DateAndDropdown">
                <div class="Forum-main-dropdown">
                  <FiMoreHorizontal className="FiMoreHorizontal" />
                  <div class="Forum-main-dropdown-content">
                    <p>
                      <a href="#">分享</a>
                    </p>
                    <p>
                      <a href="#">檢舉</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="Forum-modal-body-commet" id="Forum-modal-scrollbar">
              <p className="">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ipsam
                ad voluptates ullam odio sed, nihil atque illo earum, neque
                minus quasi aliquam quaerat quae error animi, provident
                obcaecati aut debitis.
              </p>
              <img
                className="Forum-modal-body-image"
                src={require(`./../../components/images/img1.jpg`).default}
                alt="cake"
              ></img>
              <img
                className="Forum-modal-body-image"
                src={require(`./../../components/images/img1.jpg`).default}
                alt="cake"
              ></img>
              <img
                className="Forum-modal-body-image"
                src={require(`./../../components/images/img1.jpg`).default}
                alt="cake"
              ></img>
              <img
                className="Forum-modal-body-image"
                src={require(`./../../components/images/img1.jpg`).default}
                alt="cake"
              ></img>
              <img
                className="Forum-modal-body-image"
                src={require(`./../../components/images/img1.jpg`).default}
                alt="cake"
              ></img>
            </div>
            <div className="Forum-modal-body-icon">
              <AiOutlineHeart className="AiOutlineHeart" size="2rem" />
              <p className="Forum-modal-body-icon-p">999</p>
              <AiOutlineMessage className="AiOutlineMessage" size="2rem" />
              <p className="Forum-modal-body-icon-p">999</p>
              <div className="Forum-modal-body-icon-fb">
                <AiFillFacebook size="2rem" />
                <AiOutlineInstagram size="2rem" />
              </div>
            </div>
            <div className="st-line"></div>
          </div>
        </Modal.Body>
        <Modal.Footer ClassName="modal-footer">
          <div className="Forum-modal-footer-component">
            <div className="Forum-modal-footer-account">
              <img
                className="Forum-modal-footer-account-image"
                src={require(`./../../components/images/img1.jpg`).default}
                alt="cake"
              ></img>
              <div>
                <h6 className="Forum-modal-footer-account-name">
                  奇異的小玩偶
                </h6>
                <h6 className="Forum-modal-footer-account-id">
                  @olsonlovesmakelove
                </h6>
              </div>
              <div className="Forum-main-DateAndDropdown">
                <div class="Forum-main-dropdown">
                  <FiMoreHorizontal className="FiMoreHorizontal" />
                  <div class="Forum-main-dropdown-content">
                    <p>
                      <a href="#">分享</a>
                    </p>
                    <p>
                      <a href="#">檢舉</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="Forum-modal-footer-commet">
              <p className="">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ipsam
                ad voluptates ullam odio sed, nihil atque illo earum, neque
                minus quasi aliquam quaerat quae error animi, provident
                obcaecati aut debitis.
              </p>
            </div>
            <div className="Forum-modal-footer-icon">
              <AiOutlineHeart className="AiOutlineHeart" size="2rem" />
              <p className="Forum-modal-footer-icon-p">999</p>
              {/* <AiOutlineMessage className="AiOutlineMessage" size="2rem" />
              <p className="Forum-modal-footer-icon-p">999</p> */}
            </div>
            <div className="st-line"></div>
          </div>
          <div className="Forum-modal-footer-write-component">
            <div className="Forum-modal-footer-write-account">
              <img
                className="Forum-modal-footer-write-account-image"
                src={require(`./../../components/images/img1.jpg`).default}
                alt="cake"
              ></img>
              <div>
                <h6 className="Forum-modal-footer-write-account-name">
                  奇異的小玩偶
                </h6>
                <h6 className="Forum-modal-footer-write-account-id">
                  @olsonlovesmakelove
                </h6>
              </div>
            </div>
            <div className="Forum-modal-footer-write-commet">
              {/* <input type="text" /> */}
              <textarea
                className="Forum-modal-footer-write-commet-textarea"
                id=""
              >
                留言
              </textarea>
            </div>
            <div className="Forum-modal-footer-write-commet-buttonarea">
              <Button
                className="Forum-modal-footer-write-commet-buttonsave"
                variant="primary"
              >
                送出
              </Button>
              <Button
                className="Forum-modal-footer-write-commet-buttondelete"
                variant="secondary"
              >
                刪除
              </Button>
              {/* <div className="st-line"></div> */}
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ForumCard;
