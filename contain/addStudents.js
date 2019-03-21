module.exports = function addStudenst(list, mentor, arr) {
  let students = [];
  list.map(value => {
    if (value[0]) {
      let mentorName = value[0].toLowerCase().trim();
      if (mentorName === mentor.name) {
        let studentName = String(value[1])
          .toLowerCase()
          .trim();

        students.push({
          gitHub: studentName,
          codeJam: []
        });
      }
    }
  });

  return students;
};
