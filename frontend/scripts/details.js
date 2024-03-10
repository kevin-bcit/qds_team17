const imagesName = {
    "Daily Water Intake Challenge": "s_water.png",
    "Daily Sleep Hours Challenge": "s_sleep.png",
    "Daily Fitness Challenge": "s_fitness.png",
    "Daily Deep Breathing Challenge": "s_breath.png",
    "Daily Meditation Challenge": "s_meditation.png",
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
        <a><img src="./images/x.png" class="add_button" id="button${i}"></a>
    </article>
    </section>`;

    cards += card;
  }

  mainElement.innerHTML = cards;

  // Add click event listeners for the add buttons to toggle the image
  challenges.forEach((_, index) => {
    document.getElementById(`button${index}`).addEventListener('click', function() {
      this.src = this.src.includes('x.png') ? './images/v.png' : './images/x.png';
    });
  });
}

displayCard();

