const apiUrl = 'http://localhost:3000';
const endpointChallenge = '/api/getChallengeInfo';
const endpointProgress = '/api/getProgress'

const main = $('#community-main')
const test = $('#wrapper')
const challenge_ids = [1,2]
const progress_ids = [1,2, 3, 8, 10, 11, 12, 13]

const section = `<section><h1>Challenge Title</h1><p>Challenge Description</p><p>Challenge Item</p></section>`

;(async ()=> {
    const challengeData = []

    
    challenge_ids.forEach(async (challenge_id) => {
        const res = await fetch(`${apiUrl}${endpointChallenge}?challengeId=${challenge_ids[0]}`)
        const data = await res.json()
        
        challengeData.push(data)
        
    })
    console.log(challengeData)
   
    
    progress_ids.forEach(async (progress_id) => {
        const res = await fetch(`${apiUrl}${endpointProgress}?progress_id=${progress_id}`)
        const pdata = await res.json()
        picNum = Math.floor(Math.random() * 7) + 1
        challenge = 0
        console.log(challenge)

        sectionBlock = `<section class="community-section" class="tag">
        <article>
            <figure><img src="./images/cat${picNum}.jpg"></img><figcaption>lifetime pies</figcaption></figure>
            <span class="community-title">${challengeData[challenge].title}</span><span class="community-time">2 days 5 hours</span>
            <p>${challengeData[challenge].description}</p>
            
        </article>
        <article class="community-progress">
            <div class="progressbar-item">
                <div progress-bar data-percentage="${pdata.percentageCompleteByDay*100}%">
                    <div class="progress-number">
                        <div class="progress-number-mark">
                            <span class="percent"></span>
                            <span class="down-arrow"></span>
                        </div>
                    </div>
                    <div class="progress-bg">
                        <div class="progress-fill"></div>
                    </div>
                </div>
            </div>   
        </article>
        <a class="comment-icon" href="./comment.html"><img src="./images/ellipse_comment.png" alt="comment"/></a>
        
    </section>`
        main.append(sectionBlock)

        progressBarAnimation()
    

    })  
    // const res = await fetch(`${apiUrl}${endpointProgress}?progress_id=${progress_id}`)
    // const data = await res.json()
    // console.log(data)
    // console.log(data.msg);

})()
