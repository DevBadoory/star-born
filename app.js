import { TOKEN } from "./config.js";

async function fetchData() {
  try {
    const [aopdResponse, libraryResponse] = await Promise.all([
      fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${TOKEN}&date=2003-07-19`
      ),
      fetch(
        `https://images-api.nasa.gov/search?q=space&year_start=2003&year_end=2003&media_type=image`
      ),
    ]);

    const aopd = await aopdResponse.json();
    const library = await libraryResponse.json();
  } catch (error) {
    console.error(error);
  }
}

fetchData();
