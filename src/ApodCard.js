const ApodCard = ({id, title, desc, src}) => 
{
    return (
        
        <div className="card">
            <h2 className="card__title">{title}</h2>
            <h3 className="card__date">{id}</h3>
            <img className="card__img" src={src} alt="astronomy picture of the day" />
            <p className="card__desc">{desc}</p>
        </div>
        
    );
}

export default ApodCard; 