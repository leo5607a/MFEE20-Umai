const router = require("express").Router();
const authCheck = require("./middleware");
const path = require("path");
const connection = require("../utils/database");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const momnet = require("moment");
const { studentValidation, courseValidation } = require("../validation");

// ================routes=====================

router.use((req, res, next) => {
  console.log("有一請求進入courseRoute");
  next();
});

// 阻擋未登入的請求 => 改成在個別路由中增加，因為在首頁不需登入也可以顯示課程資訊

// multer
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "public", "upload-images"));
  },
  filename: function (req, file, cb) {
    //console.log("filename", file);

    //   //取出副檔名;
    const ext = file.originalname.split(".").pop();
    cb(null, `course-${uuidv4()}.${ext}`);
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

// 測試路由
router.get("/testAPI", async (req, res) => {
  const msgObj = {
    message: "Test API is working",
  };
  return res.json(msgObj);
});

// 依照使用者id拿取課程資料 (有join category )
router.get("/member/:member_id", async (req, res) => {
  let { member_id } = req.params;

  try {
    let result = await connection.queryAsync(
      "SELECT course.*, course_category.category_name FROM course, course_category WHERE course.category_id = course_category.id AND course.member_id = ? AND course.valid = ?",
      [member_id, 1]
    );

    res.status(200).json({ success: true, course: result });
  } catch (error) {
    //console.log(error);
    res.status(500).json({ success: false, code: "E999", message: error });
  }
});

// 依照課程id拿到課程詳細資料 (包含課程詳細，所有梯次，主廚是誰)
router.get("/:course_id", async (req, res) => {
  let { course_id } = req.params;

  try {
    // 拿到課程詳細資料(有join category, member)
    let course = await connection.queryAsync(
      "SELECT course.*, course_category.category_name, member.id, member.first_name, member.last_name, member.chef_introduction FROM course, course_category, member WHERE course.category_id = course_category.id AND course.member_id = member.id AND course.id = ? AND course.valid = ?",
      [course_id, 1]
    );

    // 課程的所有梯次
    let course_batch = [];
    if (course.length !== 0) {
      course_batch = await connection.queryAsync(
        "SELECT * FROM course_batch WHERE course_id = ? AND valid = ?",
        [course_id, 1]
      );
    }

    res.status(200).json({ success: true, course, course_batch });
  } catch (error) {
    //console.log(error);
    res.status(500).json({ success: false, code: "E999", message: error });
  }
});

// 新增課程
router.post("/", authCheck, uploader.array("images"), async (req, res) => {
  // 先判斷格式是否正確
  let { error } = courseValidation(req.body);
  if (error) {
    let { key } = error.details[0].context;
    let code;
    switch (key) {
      case "category_id":
        code = "E101";
        break;
      case "course_name":
        code = "E102";
        break;
      case "course_price":
        code = "E103";
        break;
      case "course_hour":
        code = "E104";
        break;
      case "course_level":
        code = "E105";
        break;
      case "member_limit":
        code = "E106";
        break;
      case "company_name":
        code = "E107";
        break;
      case "company_address":
        code = "E108";
        break;
      case "course_batch":
        code = "E109";
        break;
      case "course_detail":
        code = "E110";
        break;
      default:
        code = "E999";
        break;
    }

    return res.status(403).json({ success: false, code });
  }

  let { id } = req.session.member;
  let now = momnet().format("YYYY-MM-DDTHH:mm:ss");
  let {
    category_id,
    course_name,
    course_price,
    course_hour,
    course_level,
    member_limit,
    company_name,
    company_address,
    course_batch,
    course_detail,
  } = req.body;

  // 課程卡片首圖預設值
  let course_image;

  // 將JSON解析回原本的data type
  course_batch = JSON.parse(course_batch);
  course_detail = JSON.parse(course_detail);

  // 處理每張相片的名稱
  req.files.forEach((file, index) => {
    if (index <= 5) {
      course_detail.six_dishes[index].dishes_image = file.filename;
    } else {
      course_detail.slider_images.push(file.filename);
    }

    // 課程卡片的首圖 (拿slider的第一張圖來用)
    if (index === 6) {
      course_image = file.filename;
    }
  });

  // JSON打包好後，再stringify，才能存入DB
  course_detail = JSON.stringify(course_detail);

  // 存入資料庫
  try {
    // 存入資料庫（課程）
    let result = await connection.queryAsync(
      "INSERT INTO course (member_id,category_id,course_detail,course_image,course_name,course_price,course_hour,course_level,member_limit,company_name,company_address, created_time, valid) VALUES (?)",
      [
        [
          id,
          category_id,
          course_detail,
          course_image,
          course_name,
          course_price,
          course_hour,
          course_level,
          member_limit,
          company_name,
          company_address,
          now,
          1,
        ],
      ]
    );

    // 拿到當下新增的course_id
    let { insertId } = result;

    // 存入資料庫（梯次 批次存入）
    course_batch.forEach(async (batch) => {
      await connection.queryAsync(
        "INSERT INTO course_batch (course_id, batch_date, member_count, created_time, valid) VALUES (?)",
        [[insertId, batch, 0, now, 1]]
      );
    });

    res.status(200).json({ success: true });
  } catch (error) {
    //console.log(error);
    res.status(500).json({ success: false, code: "E999", message: error });
  }
});

module.exports = router;
