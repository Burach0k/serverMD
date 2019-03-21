module.exports = function(list) {
  let tasks = [];
  list.map((val, index) => {
    if (index !== 0)
      tasks.push({
        name: val[0].trim(),
        link: val[1],
        status: val[2]
      });
  });

  return tasks;
};
