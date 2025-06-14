import { TOKEN } from "./config.js";
const form = document.querySelector(".hero-form");
const aopdContainer = document.getElementById("aopd-container");
let maxSelectableDate = "2025-06-08";
let loadingSpinner = document.querySelector(".loader");
let submitButtonText = document.querySelector(".btn-text");

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
    loadingSpinner.style.display = "flex";
    submitButtonText.textContent = "Loading...";
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

    displayAopdCard(aopd);
    console.log(library);
  } catch (error) {
    console.error(error);
  } finally {
    submitButtonText.textContent = "✨ Show My Space Moment";
    loadingSpinner.style.display = "none";
  }
}

function displayAopdCard(data) {
  const isImage = data.media_type === "image";
  const limit = 200;
  const fullText = data.explanation;
  const isExpandable = fullText.length > limit;

  aopdContainer.innerHTML = `
  <div class="card">
    <h2 class="card-title">${data.title}</h2>
    ${
      isImage
        ? `<img src="${data.url}" alt="${data.title}" />`
        : `<div class="video-wrapper">
            <iframe src="${data.url}${
            data.url.includes("?") ? "&" : "?"
          }mute=1" frameborder="0" allowfullscreen title="${
            data.title
          }"></iframe>
           </div>`
    }
    <div>
      <span class="card-explanation">${fullText.slice(0, limit)}...</span>
      ${isExpandable ? '<button class="show-more">Show More</button>' : ""}
    </div>
    <p class="card-copyright">
      ${data.copyright ? "Copyright: " + data.copyright : ""}
    </p>
  </div>
`;

  if (isExpandable) {
    const showMoreButton = document.querySelector(".show-more");
    const cardExplanation = document.querySelector(".card-explanation");
    setupShowMoreToggle(showMoreButton, cardExplanation, fullText, limit);
  }
}

function setupShowMoreToggle(button, textElement, fullText, limit) {
  let isExpanded = false;

  button.addEventListener("click", () => {
    isExpanded = !isExpanded;
    textElement.textContent = isExpanded
      ? fullText
      : fullText.slice(0, limit) + "...";
    button.textContent = isExpanded ? "Show less" : "Show More";
  });
}
