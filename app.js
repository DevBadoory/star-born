import { TOKEN } from "./config.js";
const form = document.querySelector(".hero-form");
let maxSelectableDate = "2025-06-08";

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = form.querySelector("input");
  let date = input.value;

  let existingError = form.querySelector(".error");
  if (existingError) {
    existingError.remove();
  }

  if (date > maxSelectableDate) {
    let errorMessage = document.createElement("label");
    errorMessage.classList.add("error");
    errorMessage.textContent =
      "Date must be between 1995-06-16 and 2025-06-08.";
    form.appendChild(errorMessage);
  } else {
    fetchData(date);
  }
});

async function fetchData(date) {
  let year = date.slice(0, 4);
  try {
    const [aopdResponse, libraryResponse] = await Promise.all([
      fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${TOKEN}&date=${date}`
      ),
      fetch(
        `https://images-api.nasa.gov/search?q=space&year_start=${year}&year_end=${year}&media_type=image`
      ),
    ]);

    const aopd = await aopdResponse.json();
    const library = await libraryResponse.json();

    console.log(aopd);
    console.log(library);
  } catch (error) {
    console.error(error);
  }
}
