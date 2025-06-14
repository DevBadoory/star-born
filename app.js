import { TOKEN } from "./config.js";
const form = document.querySelector(".hero-form");
const aopdContainer = document.getElementById("aopd-container");
const libraryContainer = document.getElementById("library-container");
let maxSelectableDate = "2025-06-08";
let loadingSpinner = document.querySelector(".loader");
let submitButtonText = document.querySelector(".btn-text");
let allLibraryItems = [];
let itemsPerPage = 5;
let currentPage = 0;

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
    displayLibrary(library);
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

function displayLibrary(data) {
  allLibraryItems = data.collection.items;

  if (!allLibraryItems.length) {
    libraryContainer.innerHTML = `<p class="no-results">No library items found for this year.</p>`;
    return;
  }

  currentPage = 0;
  libraryContainer.innerHTML = `
    <h1 class="section-title">NASA Library</h1>
    <div id="display-cards"></div>
    <button id="load-more">Load More</button>
  `;

  let loadMoreButton = document.getElementById("load-more");
  renderLibraryCards();

  loadMoreButton.addEventListener("click", () => {
    renderLibraryCards();
  });
}

function renderLibraryCards() {
  let start = currentPage * itemsPerPage;
  let end = (currentPage + 1) * itemsPerPage;
  let itemsToRender = allLibraryItems.slice(start, end);
  let displayCard = document.getElementById("display-cards");

  itemsToRender.forEach((item) => {
    const title = item.data[0].title;
    const description = item.data[0].description || "";
    const location = item.data[0].location || "";
    const copyright = item.data[0].center || "";
    const url = item.links && item.links[0] ? item.links[0].href : "";
    const limit = 200;
    const isExpandable = description.length > limit;

    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <h2 class="card-title">${title}</h2>
      <img src="${url}" alt="${title}" />
      <div>
        <span class="card-explanation">${description.slice(0, limit)}${
      isExpandable ? "..." : ""
    }</span>
        ${isExpandable ? '<button class="show-more">Show More</button>' : ""}
      </div>
      ${location ? `<p class="card-location">Location: ${location}</p>` : ""}
      ${copyright ? `<p class="card-copyright">Source: ${copyright}</p>` : ""}
    `;

    displayCard.append(card);

    if (isExpandable) {
      const showMoreButton = card.querySelector(".show-more");
      const explanationSpan = card.querySelector(".card-explanation");
      setupShowMoreToggle(showMoreButton, explanationSpan, description, limit);
    }
  });
  currentPage++;

  if (currentPage * itemsPerPage >= allLibraryItems.length) {
    let loadMoreButton = document.getElementById("load-more");
    loadMoreButton.style.display = "none";
  }
}
