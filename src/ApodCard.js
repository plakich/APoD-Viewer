import React from 'react';

const ApodCard = ({id, title, desc, src}) => 
{
    return (
        
        <div className="card">
            <h2 className="card__title">{title}</h2>
            <h3 className="card__date">{id}</h3>
            <img className="card__img" src={src}/>
            <p className="card__desc">{desc}</p>
        </div>
        
    );
}

export default ApodCard; 