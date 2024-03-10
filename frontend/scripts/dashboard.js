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
      todayGoalsDiv += `
      <section id="fifth-section" class="tag today_goal">
        <article class="event_icon">
          <img src=${icons[progress.item.replace(" ", "")]}>
        </article>
        <article>
            <a href="details.html"><img src="./images/detail_button.png" class="detail_button"></a>
            <h2><span class="title_underline">${progress.title}</span></h2>
            <p>${progress.target - progress.completed_amount} ${
        progress.unit
      }(s) left!</p>
            ${i == todayProgress.data.length - 1 ? add_button : ""}
        </article>
      </section>
      `;
    }
    $("#today_goals").html(todayGoalsDiv);
  } else {
    const todayGoalsDiv = `
    <section id="fifth-section" class="tag today_goal">
      <h2><span class="title_underline">Let's start a challenge!</span></h2>
      ${add_button}
    </section>
    `;
    $("#today_goals").html(todayGoalsDiv);
  }
}

async function setup() {
  let myInfo = $.parseJSON(await getUserInfo());
  $("#username").html(myInfo.username);
  renderQuote();
  renderRewardStatus(myInfo.userID);
  renderTodayProgress();
}

$(document).ready(setup);
