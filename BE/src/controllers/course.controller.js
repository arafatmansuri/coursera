//User Accessible Controllers
async function previewCourses(req, res) {}
async function purchaseCourse(req, res) {}

//Admin Accessible Controllers
async function addCourse(req, res) {}
async function displayAdminCourses(req, res) {}
async function updateCourse(req, res) {}

module.exports = {
  previewCourses,
  purchaseCourse,
  addCourse,
  displayAdminCourses,
  updateCourse,
};
