const apiUrl = 'http://localhost:3000';
const endpointChallenge = '/api/getChallengeInfo';
const endpointProgress = '/api/getProgress'
const endpointUser = '/api/getUserInfo'

const main = $('#community-main')
const test = $('#wrapper')
const challenge_ids = [1,2, 4, 5, 6]
const progress_ids = [1,2, 3, 8, 10, 11, 12, 13]
const support = ["Almost halfway in collecting today’s apple. Wish me luck everyone!",
    "Argh! Almost done all of deep breathing exercises for today...",
    "Lets go!!! Just collected another apple today. 6th pie incoming!"]


;(async ()=> {
    const challengeData = []

    
    challenge_ids.forEach(async (cid) => {
        const res = await fetch(`${apiUrl}${endpointChallenge}?challengeId=${cid}`)
        const data = await res.json()
        
        challengeData.push(data)
        
    })
    console.log(challengeData)
   
    
    progress_ids.forEach(async (progress_id) => {
        const res = await fetch(`${apiUrl}${endpointProgress}?progress_id=${progress_id}`)
        const pdata = await res.json()
        picNum = Math.floor(Math.random() * 7) + 1
        challenge = Math.floor(Math.random() * challengeData.length)
        console.log(challenge)
        console.log(pdata)



        sectionBlock = `<section class="community-section" class="tag">
        <article>
            <figure><img src="./images/cat${picNum}.jpg"></img><figcaption>lifetime pies</figcaption></figure>
            <span class="community-title">${pdata.username}</span><span class="community-time">2 days 5 hours</span>
            <p>${support[Math.floor(Math.random() * support.length)]}</p>
            
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
    

})()
