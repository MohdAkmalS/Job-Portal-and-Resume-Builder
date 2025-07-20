function filterJobs() {
  const dateFilter = document.getElementById("date-filter").value;
  const jobTypeFilter = document.getElementById("job-type-filter").value;
  const experienceFilter = document.getElementById("experience-filter").value;
  const jobCards = document.querySelectorAll(".job-card");

  jobCards.forEach((card) => {
    const jobDate = card.getAttribute("data-date");
    const jobType = card.getAttribute("data-job-type");
    const experience = card.getAttribute("data-experience");

    let dateMatch = dateFilter === "all" || dateFilter === jobDate;
    let typeMatch = jobTypeFilter === "all" || jobTypeFilter === jobType;
    let experienceMatch =
      experienceFilter === "all" || experienceFilter === experience;

    if (dateMatch && typeMatch && experienceMatch) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}