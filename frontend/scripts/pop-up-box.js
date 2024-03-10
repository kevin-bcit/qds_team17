const addCmtBtn = $("#comment-add-btn");
const popup = $("#pop");
const popupContent = $("#pop-content");
const popupClose = $(".close-pop");

popupClose.click(e=>{
    
    if(popup.css("display") !== "none"){
        popup.addClass("fadeOutAnime");
        setTimeout(()=>{
            popup.css("display", "none");
            popup.removeClass("fadeOutAnime");
        }, 500)
    }
    if(popPlayerSelection.css("display") !== "none"){
        popPlayerSelection.addClass("fadeOutAnime");
    }
})

addCmtBtn.click(e=>{
    e.preventDefault();

    popup.css("display", "block");
    popup.addClass("fadeInAnime");
    
    setTimeout(()=>{
        popup.css("opacity",1);
        popup.removeClass(".fadeInAnime");
    }, 500)
    
})