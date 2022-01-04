import ApodCard from "./";
import { render, screen, within } from "@testing-library/react";

describe("ApodCard", () =>
{
    const apod = {
        id: "2021-12-09",
        title: "A Total Eclipse of the Sun",
        media_type: "image",
        desc:
          `Few were able to stand in the Moon's shadow and watch the December
          4 total eclipse of the Sun. Determined by celestial mechanics 
          and not geographical boundaries, the narrow path of totality 
          tracked across planet Earth's relatively inaccessible southernmost
          continent. Still, some enthusiastic and well-insulated eclipse chasers
          were rewarded with the dazzling spectacle in Antarctica's cold but
          clear skies. Taken just before the brief totality began, this
          image from a ground-based telescope inside ...`,
        hiResSrc: "https://apod.nasa.gov/apod/image/2112/SOLARECLIPSE2021FORDISTROHighRes.jpg",
        lowResSrc: "https://apod.nasa.gov/apod/image/2112/SOLARECLIPSE2021FORDISTROHighRes1024.jpg",
    };
    
    describe("correctly renders with all data displayed on card", () =>
    {
        it("correctly renders card title", () =>
        {
            render(<ApodCard
                    id={apod.id} 
                    title={apod.title} 
                />);
            const actual = screen.getByRole("heading").textContent;
            
            const expected = apod.id + " " + apod.title; 
            
            expect(actual).toBe(expected); 
        });
        
        it("correctly renders card date", () =>
        {
            render(<ApodCard
                    id={apod.id} 
                />);
            
            // need to use [1] because the first date is in the heading
            // which we don't want. 
            const actual = screen.getAllByText(apod.id)[1].textContent;
            const expected = apod.id; 
            
            expect(actual).toBe(expected); 
            
        });
        
        it("correctly renders card image when apod is an image, " +
            "and doesn't render video", () =>
        {
            render(<ApodCard
                    id={apod.id} 
                    title={apod.title}
                    media_type="image"
                    lowResSrc={apod.lowResSrc} 
                    videoSrc={null}
                    />);
            
            const img = screen.getByRole("img");
            const video = screen.queryByTitle(`${apod.id}: ${apod.title}`); //have to use query, not get
            
            expect(img).toBeInTheDocument(); 
            expect(video).not.toBeInTheDocument(); 
            
        });
        
        it("correctly renders card video when apod is a video, " +
            "and doesn't render an image", () =>
        {
            render(<ApodCard
                    id="2021-11-10" 
                    title={apod.title}
                    media_type="video"
                    lowResSrc={apod.lowResSrc} 
                    videoSrc={apod.lowResSrc}
                    />);
            
            const video = screen.getByTitle(`2021-11-10: ${apod.title}`); //format for our video titles is date: title
            const img = screen.queryByRole("img"); 
            
            expect(video).toBeInTheDocument();
            expect(img).not.toBeInTheDocument(); 
        });
        
        it("correctly renders card description", () =>
        {
            render(<ApodCard desc={apod.desc} />);
            
            // We first have to remove extra whitespace introduced when 
            // we formatted the mock data using a template literal. Note
            // rendering the element onto the page automatically does this for 
            // us. 
            const actual = screen.getByText( apod.desc.replace(/\s+/g, ' ').trim() ).textContent;  
            
            expect(actual).toBe(apod.desc); 
        });
        
        it("correctly renders link to view hi-res image when apod is an image", () =>
        {
            render(<ApodCard
                    media_type="image"
                    hiResSrc={apod.hiResSrc}
                />); 
            
            const link = screen.getByRole("link").textContent;
            const imgLink = "View hi-res image";
            
            expect(link).toBe(imgLink); 
            
        });
        
        it("correctly renders link to view video when apod is a video", () =>
        {
            render(<ApodCard
                    media_type="video"
                    videoSrc={apod.lowResSrc}
                />); 
            
            const link = screen.getByRole("link").textContent;
            const vidLink = "View video";
            
            expect(link).toBe(vidLink); 
            
        });
        
    });
    
    
    it("hides visually the date within the heading", () =>
    {
        render(<ApodCard
                    id={apod.id} 
                    title={apod.title} 
                />);
        
        const actual = within(
                screen.getByRole( 'heading', {name: /2021\-12\-09 A Total Eclipse of the Sun/i} )
        ).getByText(/2021\-12\-09/i);
        
        expect(actual).toHaveClass("hide-visually");
       
        /*
            expect(actual).not.toBeVisible();
            
            ^The above line of code won't work because of how 
            toBeVisible accounts for visibility:
            https://github.com/testing-library/jest-dom#tobevisible
            
            The technique we use for hiding visually is 
            recommended by WebAIM. See heading titled CSS clip: 
            https://webaim.org/techniques/css/invisiblecontent/
            
            It hides visually for sighted users (but unfortunately,
            according to the toBeVisible fn that means it's still visible), but 
            keeps available for screen readers, something other 
            visual hiding techniques don't allow for. 
        */
    });
    
    it("hides the date under the heading from screen readers", () =>
    {
        render(<ApodCard id={apod.id} />);
        
        const time = screen.getAllByText(apod.id)[1];
        
        expect(time).toHaveAttribute("aria-hidden"); 
    });
    
    it("has accessible description for video", () =>
    {
        render(<ApodCard
                    id="2021-11-10" 
                    title={apod.title}
                    media_type="video"
                    lowResSrc={apod.lowResSrc} 
                    videoSrc={apod.lowResSrc}
                />);
        
        const video = screen.getByTitle(`2021-11-10: ${apod.title}`); //format for our video titles is date: title
        
        expect(video).toHaveAccessibleDescription();
        
    });
    
    it("doesn't display a link to view a high res image when " +
        "high res image is the same as regular card url", () =>
    {
         render(<ApodCard
                    hiResSrc={apod.lowResSrc} 
                    lowResSrc={apod.lowResSrc} 
                />);
        
        const hiResLink = screen.queryByRole('link', {name: /View hi-res image/i});
        
        expect(hiResLink).not.toBeInTheDocument(); 
    });
});