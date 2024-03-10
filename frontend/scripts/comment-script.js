const apiUrl = 'http://localhost:3000';
const endpointChallenge = '/api/getChallengeInfo';
const endpointProgress = '/api/getProgress'
const endpointComment = '/api/getComment'
const endpointUser = '/api/getUserInfo'

const main = $('#comment-main')
const challenge_id = 1
const progress_ids = [1,2, 3, 8, 10, 11, 12, 13]


const selectedProgress = progress_ids[Math.floor(Math.random() * progress_ids.length)]
picNum = Math.floor(Math.random() * 7) + 1

console.log(`progress_id=${selectedProgress}`)

;(async ()=> {
    
    const cres = await fetch(`${apiUrl}${endpointChallenge}?challengeId=${challenge_id}`)
    const cdata = await cres.json()
    const pres = await fetch(`${apiUrl}${endpointProgress}?progress_id=${selectedProgress}`)
    const pdata = await pres.json()

    sectionBlock = `<section class="community-section" class="tag">
        <article>
            <figure><img src="./images/cat${picNum}.jpg"></img><figcaption>lifetime pies</figcaption></figure>
            <span class="community-title">${cdata.title}</span><span class="community-time">2 days 5 hours</span>
            <p>${cdata.description}</p>
            
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
        <a class="comment-icon" href=""><img src="./images/ellipse_comment_blk.png" alt="comment"/></a>
        
    </section>`
        main.append(sectionBlock)

        progressBarAnimation()

        try{
            const comres = await fetch(`${apiUrl}${endpointComment}?progress_id=${selectedProgress}`)
            const comdata = await comres.json()
            console.log(comdata)

            

            comdata.data.forEach(ele => async ()=>{

                const ures = await fetch(`${apiUrl}${endpointUser}?uid=${ele.commentor_id}`)
                const udata = await ures.json()
                console.log(udata)

                const picNum = Math.floor(Math.random() * 7) + 1

                const comBlock = `<section class="comment-section" class="fadein_img">
                <article>
                    <figure><img src="./images/cat${picNum}.jpg"></img></figure>
                    <span class="comment-title">${uid}</span><span class="community-time">${ele.creation_date}</span>
                    <p>${ele.content}</p>
                </article>
            </section>`
            
            
                main.append(comBlock)
            });

        }catch(err){
            const comBlock = `<section class="comment-section" class="fadein_img">
            <article>
                <span class="comment-title">No comment yet</span>
                <p>Be the first one to show your support!</p>
            </article>
        </section>`
        
        
            main.append(comBlock)
        }
        
        
})()
    
   
    
