import {memo} from "react"; 
import ApodCard from "./ApodCard"; 

const ApodList = ({apodList}) => 
{
  
    return (
        
        apodList.map( apod =>
        {
            const {date, explanation: desc, title, url, hdurl, media_type} = apod; 
            return <ApodCard key={date} 
                        id={date} 
                        title={title} 
                        media_type={media_type}
                        desc={desc} 
                        hiResSrc={hdurl} 
                        lowResSrc={url} 
                        videoSrc={media_type === "video" ? url : null} // null else imgs will show vid link too
                    />;
        })
    );
};

export default memo(ApodList);