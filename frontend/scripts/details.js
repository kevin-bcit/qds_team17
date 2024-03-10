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

async function getCurrentUserId() {
  let res = await getUserInfo();
  let userInfo = JSON.parse(res);

  if (userInfo.loggedIn) {
    return userInfo.userID;
  } else {
    console.log("User is not logged in.");
    return null; // Or handle the case where the user is not logged in as needed
  }
}


async function displayCard() {
  const res = await getAllChallengeInfo();
  const challenges = JSON.parse(res).data;
  const mainElement = document.getElementById("details-main");

  let cards = "";

  for (let i = 0; i < challenges.length; i++) {
    let title = challenges[i]["title"];
    let description = challenges[i]["description"];
    let target = challenges[i]["default_target"];

    const card = `<section class="details-section tag fadeInAnime">
    <article>
        <figure><img src="./images/${imagesName[title]}"></img></figure>
        <span class="details-title">${title}</span>
        <p>${description}</p>
        <p>Target: ${target}</p>
    </article>
    <article>
        <a><img src="./images/x.png" class="add_button" id="button${i}"></a>
    </article>
    </section>`;

    cards += card;
  }

  mainElement.innerHTML = cards;



  // Add click event listeners for the add buttons to toggle the image
  challenges.forEach((challenge, index) => {
    document.getElementById(`button${index}`).addEventListener('click', async function() {
      this.src = this.src.includes('x.png') ? './images/v.png' : './images/x.png';
    
        // let res = await getRequest('/api/getUserInfo');
        // let userId = JSON.parse(res).data.user_id;

        let userId = await getCurrentUserId();
        let challengeId = challenge.challenge_id;
        let target = challenge.default_target;

        console.log("currect user id:" + userId);
        console.log("challenge id: " + challengeId);
        console.log("target:" + target);
    
        await createProgress(userId, challengeId, target);
    });
  });
}

displayCard();

