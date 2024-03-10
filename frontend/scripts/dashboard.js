async function renderQuote() {
  const quote = $.parseJSON(await getQuote());
  $("#quote").html(quote.quote);
  $(".author").html("- " + quote.username);
}

async function renderRewardStatus(userId) {
  const rewards = $.parseJSON(await getRewardStatus(userId));
  if (!rewards.data) {
    rewards.data = {
      user_id: userId,
      numOfApple: 0,
      numOfApplePie: 0,
    };
  }
  $("#daysLeft").html(10 - rewards.data.numOfApple);
  $(".circle").attr("stroke-dasharray", `${rewards.data.numOfApple * 10}, 100`);
  $("#applePiePercentage").html(`${rewards.data.numOfApple * 10}%`);
  $("#appleCount").html(`${rewards.data.numOfApple} apples picked`);
  $("#applePieCount").html(`${rewards.data.numOfApplePie} pies baked`);
}

async function renderTodayProgress() {
  const icons = {
    Water: "./images/water_icon.png",
    DeepBreathing: "./images/deep_breathing_icon.png",
    Fitness: "./images/fitness_icon.png",
    Sleep: "./images/sleep_icon.png",
    Meditation: "./images/meditation_icon.png",
  };
  const todayProgress = $.parseJSON(await getTodayProgress());
  const add_button = `<a><img src="./images/add_button.png" class="add_button"></a>`;
  if (todayProgress.data) {
    let todayGoalsDiv = "";
    for (let i = 0; i < todayProgress.data.length; i++) {
      const progress = todayProgress.data[i];
      if (progress.completed_amount >= progress.target) {
        continue;
      }
      todayGoalsDiv += `
      <div id="progress_${progress.progress_id}">
        <section id="fifth-section" class="tag today_goal" >

          <article class="event_icon">
            <img src=${icons[progress.item.replace(" ", "")]}>
          </article>


          <article>
            <a href="details.html">
              <img src="./images/detail_button.png" class="detail_button">
            </a>

            <h2>
              <span class="title_underline">
                ${progress.title}
              </span>
            </h2>

            <p>
              <span id="left_${progress.progress_id}">
                ${progress.target - progress.completed_amount}
              </span> 
              ${progress.unit}(s) left!
            </p>

            <a class="incrementButton" value=${progress.completed_amount} id=${progress.progress_id}>
              <img src="./images/add_button.png" class="add_button">
            </a>
          </article>


        </section>
      </div>
      `;
    }
    $("#today_goals").html(todayGoalsDiv);
  } else {
    const todayGoalsDiv = `
    <section id="fifth-section" class="tag today_goal">
      <h2>
        <span class="title_underline">
          Let's start a challenge!
        </span>
      </h2>
    </section>
    `;
    $("#today_goals").html(todayGoalsDiv);
  }
}

async function incrementProgress() {
  progressId = $(this).attr("id");
  completedAmount = parseInt($(this).attr("value"));
  newValue = parseInt($(`#left_${progressId}`).html()) - 1;
  $(`#left_${progressId}`).html(newValue);
  if (newValue == 0) {
    $(`#progress_${progressId}`).hide();
  }
  await updateProgress(progressId, completedAmount + 1);
}

async function setup() {
  let myInfo = $.parseJSON(await getUserInfo());
  $("#username").html(myInfo.username);
  renderQuote();
  renderRewardStatus(myInfo.userID);
  renderTodayProgress();
  $("body").on("click", ".incrementButton", incrementProgress);
}

$(document).ready(setup);
