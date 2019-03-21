module.exports = function(list) {
  let mentors = [];
  list.map((value, index) => {
    if (value[0] && index !== 0) {
      let mentorName = value[0].toLowerCase().trim() + ' ' + value[1].toLowerCase().trim();
      let gitHub = value[4]
        .toLowerCase()
        .trim()
        .substr(value[4].indexOf('/', 10) + 1);
      mentors.push({
        name: mentorName,
        gitHub: gitHub,
        students: []
      });
    }
  });

  return mentors;
};
