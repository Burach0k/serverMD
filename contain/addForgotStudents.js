module.exports = function addStudenst(list, mentor, arr) {
  let forgotStudents = [];

  list.map(val => {
    let student_gitHub = val[2].toLowerCase().trim();
    let mentor_gitHub = val[1].toLowerCase().trim();
    let flag = false;

    if (mentor_gitHub.slice(19) === mentor.gitHub) {
      arr.map(mentor => {
        for (var i = 0; i < mentor.students.length; i++) {
          if (student_gitHub.includes(mentor.students[i].gitHub)) {
            flag = true;
            break;
          }
        }
      });

      for (var i = 0; i < forgotStudents; i++) {
        if (student_gitHub.includes(forgotStudents[i].gitHub)) {
          flag = true;
          break;
        }
      }

      if (!flag) {
        forgotStudents.push({
          gitHub: student_gitHub.slice(19),
          codeJam: []
        });
      }
    }
  });

  return forgotStudents;
};
