const xlsx = require("node-xlsx");
const fs = require("fs");

module.exports = function() {
  const TasksFunction = require("./Tasks.js");
  const addMentors = require("./addMentors");
  const addStudents = require("./addStudents");
  const addForgotStudents = require("./addForgotStudents");
  const addInfo = require("./addInfo");

  const path = require("path");
  const dirPath = path.join(__dirname, "../data");

  const workSheetsFromFile = xlsx.parse(dirPath + `/Mentor-score.xlsx`);
  const workSheetsFromFile2 = xlsx.parse(
    dirPath + `/Mentor-students-pairs.xlsx`
  );
  const workSheetsFromFile3 = xlsx.parse(dirPath + `/Tasks.xlsx`);

  let newarr = { Mentors: [], "Code Jam": [] };

  const mentor_students_pairs_list0 = workSheetsFromFile2[0]["data"];
  const mentor_students_pairs_list1 = workSheetsFromFile2[1]["data"];
  const mentor_score = workSheetsFromFile[0]["data"];
  const tasks = workSheetsFromFile3[0]["data"];

  newarr["Mentors"] = addMentors(mentor_students_pairs_list1);

  newarr.Mentors.map((val, ind, arr) => {
    val.students = addStudents(mentor_students_pairs_list0, val, arr);
  });

  newarr.Mentors.map((val, ind, arr) => {
    val.students = val.students.concat(
      addForgotStudents(mentor_score, val, arr)
    );
  });

  newarr.Mentors.map((val, ind, arr) => {
    val.students.map(student => {
      student.codeJam = addInfo(mentor_score, tasks, student, arr);
    });
  });

  newarr["Code Jam"] = TasksFunction(tasks);

  ddd = JSON.stringify(newarr, null, "\t");

  fs.writeFile("data.json", ddd, "utf-8", () => {
    console.log("all done");
  });
};
