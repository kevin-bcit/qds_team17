const imagesName = {
    "Water": "s_water.png",
    "Sleep": "s_sleep.png",
    "Fitness": "s_fitness.png",
    "Deep Breathing": "s_breath.png",
    "Meditation": "s_meditation.png",
}
function getRequest(url) {
  return new Promise((resolve) => {
    let xmlHttp = new XMLHttpRequest();

    xmlHttp.open("GET", url, true);
    xmlHttp.onload = function () {
      resolve(xmlHttp.response);
    };

    xmlHttp.send(null);
  });
}

async function getAllChallengeInfo() {
  let res = await getRequest(`/api/getAllChallengeInfo`);
  return res;
}

async function displayCard() {
  const res = await getAllChallengeInfo();
  const challenges = JSON.parse(res).data;
  console.log(challenges);
  const mainElement = document.getElementById("details-main");

  let cards = "";

  for (let i = 0; i < challenges.length; i++) {
    let title = challenges[i]["title"];
    let description = challenges[i]["description"];

    const card = `<section class="details-section tag fadeInAnime">
    <article>
        <figure><img src="./images/${imagesName[title]}"></img></figure>
        <span class="details-title">${title}</span>
        <p>${description}</p>
    </article>
    <article>
        <a><img src="./images/add_button.png" class="add_button"></a>
    </article>
    </section>`;

    cards += card;
  }

  mainElement.innerHTML = cards;
}

displayCard();
