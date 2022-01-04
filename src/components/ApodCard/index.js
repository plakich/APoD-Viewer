const ApodCard = ({id, title, desc, hiResSrc, lowResSrc, videoSrc, media_type}) => 
{
    // For some of the earliest apods, 
    // the hd-URL provided by the api
    // was the same as the regular url (lowRes).
    // This avoids displaying a link to the same
    // image in the main card. 
    if (hiResSrc === lowResSrc) 
    {
        hiResSrc = null; 
    }
    
    return (
        
        <div className="card">
            {
            
                /*
                We use date (but hide visually) inside h2 for people using heading overview 
                on screen readers. We then hide for screen readers (aria-hidden) outside heading but display 
                visually. 
                */
                
            }
            <h2 className="card__title"><time dateTime={id} className="hide-visually">{id}</time> {title}</h2>
            <time aria-hidden="true" dateTime={id} className="card__date">{id}</time>
            {media_type === "image" && <a href={lowResSrc}><img className="card__img" src={lowResSrc} alt={"Click to view APOD for " + id}/></a>}
            {media_type === "video" && 
            <iframe
                title={`${id}: ${title}`}                      
                src={videoSrc}
                className="card__img"
                allow="encrypted-media"
                allowFullScreen={true}
            ></iframe>}
            <p className="card__desc">{desc}
            {hiResSrc && <a href={hiResSrc} className="card__img__hi-res-link">View hi-res image</a>}
            {videoSrc && <a href={videoSrc} className="card__img__hi-res-link">View video</a>}  
            </p>
            
        </div>
        
    );
};

export default ApodCard; 