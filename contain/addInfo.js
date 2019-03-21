module.exports = function addInfo(list, list2, myStudent, array) {
  
  function findCorrectName(taskName) {
    for(var i = 0; i < list2.length; i++){
      let newTaskName = list2[i][0].replace(/\s+/g, '');
      if (newTaskName.includes(taskName.replace(/\s+/g, ''))) return list2[i][0].trim();
    }
    return taskName.trim();
  }

  let codeJamList = [];
  list.map((val, ind, arr) => {
    let student_gitHub = val[2].slice(19).toLowerCase();
    array.map(mentor => {
      mentor.students.map(student => {
        if (student.gitHub === myStudent.gitHub) {
          if (student.gitHub === student_gitHub) {
            let flag = true;
            codeJamList.map((codeJam, index) => {
              if (codeJam.name === findCorrectName(val[3])) {
                codeJamList[index].value = val[5];
                codeJamList[index]['pull request'] = val[4];
                flag = false;
              }
            });
            if (flag)
              codeJamList.push({
                name: findCorrectName(val[3]),
                value: val[5],
                'pull request': val[4],
                status: {}
              });
          }
        }
      });
    });
  });
  list2.map((val, index) => {
    let flag = true;
    codeJamList.map(codeJam => {
      if (val[0].trim() === codeJam.name) {
        flag = false;
      }
    });
    if (flag && val[2].toLowerCase() === 'in progress')
      codeJamList.push({
        name: val[0].trim(),
        value: 0,
        'pull request': '',
        status: val[2]
      });
  });

  list2.map((val, ind, arr) => {
    array.map(mentor => {
      mentor.students.map(student => {
        if (student.gitHub === myStudent.gitHub) {
          codeJamList.map(codeJam => {
            if (val[0].trim() === codeJam.name) {
              if (
                codeJam['pull request'] !== '' &&
                val[2].toLowerCase() !== 'todo' &&
                val[2].toLowerCase() !== 'in progress'
              ) {
                codeJam.status = 'Checked';
              } else {
                if (val[2].toLowerCase() === 'in progress') codeJam.status = 'InProgress';
                if (val[2].toLowerCase() === 'todo') codeJam.status = 'ToDo';
                if (val[2].toLowerCase() === 'checking') codeJam.status = 'Checking';
              }
            }
          });
        }
      });
    });
  });

  return codeJamList;
};
