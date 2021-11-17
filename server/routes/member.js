const router = require("express").Router();
const path = require("path");
const connection = require("../utils/database");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const momnet = require("moment");
const {
  userInfoValidation,
  passwordValidation,
  creditCardValidation,
  studentValidation,
} = require("../validation");

// multer
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "public", "upload-images"));
  },
  filename: function (req, file, cb) {
    //console.log("filename", file);
    // 取出副檔名
    const ext = file.originalname.split(".").pop();
    cb(null, `avatar-${uuidv4()}.${ext}`);
  },
});
const uploader = multer({
  storage: storage,
  // 可以用來過濾檔案
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype !== "image/jpeg" &&
      file.mimetype !== "image/jpg" &&
      file.mimetype !== "image/png"
    ) {
      cb(new Error("不允許的檔案類型 "), false);
    }
    cb(null, true);
  },
  // 限定檔案大小 4M
  limits: {
    fileSize: 1024 * 1024 * 4,
  },
});

router.use((req, res, next) => {
  console.log("有一請求進入memberRoute");
  next();
});

// 阻擋未登入的請求
router.use((req, res, next) => {
  //console.log(req.session);
  if (!req.session.member) {
    return res.status(403).send({ success: false, code: "A005" });
  }
  next();
});

// 測試路由
router.get("/testAPI", async (req, res) => {
  const msgObj = {
    message: "Test API is working",
  };
  return res.json(msgObj);
});

// 修改使用者基本資料
router.put("/info", async (req, res) => {
  // 先判斷格式是否正確
  let { error } = userInfoValidation(req.body);
  if (error) {
    let { key } = error.details[0].context;
    let code;
    switch (key) {
      case "first_name":
        code = "G001";
        break;
      case "last_name":
        code = "G002";
        break;
      case "telephone":
        code = "G003";
        break;
      case "birthday":
        code = "G004";
        break;
      default:
        code = "G999";
        break;
    }

    return res.status(403).json({ success: false, code });
  }

  let { id } = req.session.member;
  let { first_name, last_name, telephone, birthday } = req.body;

  try {
    let result = await connection.queryAsync(
      "UPDATE member SET first_name = ?, last_name = ?, telephone = ?, birthday = ? WHERE id = ?",
      [first_name, last_name, telephone, birthday, id]
    );
    res.status(200).json({ success: true });
  } catch (error) {
    //console.log(error);
    res.status(500).json({ success: false, code: "G999", message: error });
  }
});

// 修改使用者密碼
router.put("/password", async (req, res) => {
  let { id } = req.session.member;
  let { newPassword, passwordConfirm } = req.body;

  // 判斷新密碼格式是否正確
  let { error } = passwordValidation({ newPassword });
  if (error) return res.status(403).json({ success: false, code: "G006" });

  try {
    // 找到當前使用者資料
    let oldPassword = await connection.queryAsync(
      "SELECT password FROM member WHERE id = ?",
      id
    );
    oldPassword = oldPassword[0].password;

    // 比對新舊密碼
    let isCompare = await bcrypt.compare(passwordConfirm, oldPassword);

    // 新舊密碼不符合
    if (!isCompare)
      return res.status(401).json({ success: false, code: "G005" });

    // 將新密碼加密
    let hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新資料
    let result = await connection.queryAsync(
      "UPDATE member SET password = ? WHERE id = ?",
      [hashedPassword, id]
    );

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, code: "G999", message: error });
  }
});

// 修改使用者頭像
router.put("/avatar", uploader.single("avatar"), async (req, res) => {
  let { id } = req.session.member;
  let { filename } = req.file;
  // console.log(filename);

  try {
    let result = await connection.queryAsync(
      "UPDATE member SET avatar = ? WHERE id = ?",
      [filename, id]
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, code: "G999", message: error });
  }
});

// 修改信用卡資訊
router.put("/creditCard", async (req, res) => {
  let { id } = req.session.member;
  let { number, name } = req.body;

  // 判斷新格式是否正確
  let { error } = creditCardValidation({ number, name });
  if (error) {
    if (error.details[0].context.key === "number") {
      return res.status(403).json({ success: false, code: "F001" });
    } else if (error.details[0].context.key === "name") {
      return res.status(403).json({ success: false, code: "F002" });
    }
  }

  try {
    let result = await connection.queryAsync(
      "UPDATE member SET credit_card_number = ?, credit_card_name = ? WHERE id = ?",
      [number, name, id]
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, code: "G999", message: error });
  }
});

// 新增預設學員資料
router.post("/student", async (req, res) => {
  // 先判斷格式是否正確
  let { error } = studentValidation(req.body);
  if (error) {
    let { key } = error.details[0].context;
    let code;
    switch (key) {
      case "first_name":
        code = "G001";
        break;
      case "last_name":
        code = "G002";
        break;
      case "telephone":
        code = "G003";
        break;
      case "birthday":
        code = "G004";
        break;
      case "email":
        code = "G007";
        break;
      default:
        code = "G999";
        break;
    }

    return res.status(403).json({ success: false, code });
  }

  let { id } = req.session.member;
  let now = momnet().format("YYYY-MM-DDTHH:mm:ss");
  let { first_name, last_name, birthday, email, telephone } = req.body;

  try {
    let result = await connection.queryAsync(
      "INSERT INTO student (member_id, first_name, last_name, birthday, email, telephone, created_time, valid) VALUES (?)",
      [[id, first_name, last_name, birthday, email, telephone, now, 1]]
    );

    res.status(200).json({ success: true });
  } catch (error) {
    //console.log(error);
    res.status(500).json({ success: false, code: "G999", message: error });
  }
});

// 拿取所有學員資料
router.get("/student", async (req, res) => {
  let { id } = req.session.member;

  try {
    let result = await connection.queryAsync(
      "SELECT * FROM student WHERE member_id = ? AND valid = ?",
      [id, 1]
    );
    res.status(200).json({ success: true, students: result });
  } catch (error) {
    //console.log(error);
    res.status(500).json({ success: false, code: "G999", message: error });
  }
});

// 編輯預設學員資料
router.put("/student", async (req, res) => {
  // 先判斷格式是否正確
  let { error } = studentValidation(req.body);
  if (error) {
    let { key } = error.details[0].context;
    let code;
    switch (key) {
      case "first_name":
        code = "G001";
        break;
      case "last_name":
        code = "G002";
        break;
      case "telephone":
        code = "G003";
        break;
      case "birthday":
        code = "G004";
        break;
      case "email":
        code = "G007";
        break;
      default:
        code = "G999";
        break;
    }

    return res.status(403).json({ success: false, code });
  }

  //let now = momnet().format("YYYY-MM-DDTHH:mm:ss");
  let { id, first_name, last_name, birthday, email, telephone } = req.body;

  try {
    let result = await connection.queryAsync(
      "UPDATE student SET first_name = ?, last_name = ?, birthday = ?, email = ?, telephone = ? WHERE id = ?",
      [first_name, last_name, birthday, email, telephone, id]
    );
    res.status(200).json({ success: true });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ success: false, code: "G999", message: error });
  }
});

// 刪除預設學員資料
router.put("/studentDelete", async (req, res) => {
  //let now = momnet().format("YYYY-MM-DDTHH:mm:ss");
  let { id } = req.body;
  try {
    let result = await connection.queryAsync(
      "UPDATE student SET valid = ? WHERE id = ?",
      [0, id]
    );
    res.status(200).json({ success: true });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ success: false, code: "G999", message: error });
  }
});

module.exports = router;
