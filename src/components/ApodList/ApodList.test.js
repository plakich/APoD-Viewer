import ApodList from "./";
import { render, screen } from "@testing-library/react";


describe("ApodList", () =>
{
    const apod = [
        {
            date: "2021-12-09",
            title: "A Total Eclipse of the Sun",
            media_type: "image",
            explanation:
              `Few were able to stand in the Moon's shadow and watch the December
              4 total eclipse of the Sun. Determined by celestial mechanics 
              and not geographical boundaries, the narrow path of totality 
              tracked across planet Earth's relatively inaccessible southernmost
              continent. Still, some enthusiastic and well-insulated eclipse chasers
              were rewarded with the dazzling spectacle in Antarctica's cold but
              clear skies. Taken just before the brief totality began, this
              image from a ground-based telescope inside ...`,
            hdurl: "https://apod.nasa.gov/apod/image/2112/SOLARECLIPSE2021FORDISTROHighRes.jpg",
            url: "https://apod.nasa.gov/apod/image/2112/SOLARECLIPSE2021FORDISTROHighRes1024.jpg",
        },
        {
            date: "2021-12-08",
            title: "Comet Hale-Bopp Over Val Parola Pass",
            media_type: "image",
            explanation:
                `Comet Hale-Bopp, the Great Comet of 1997,
                became much brighter than any surrounding stars.
                It was seen even over bright city lights. Away
                from city lights, however, it put on quite a
                spectacular show. Here Comet Hale-Bopp was
                photographed above Val Parola Pass in the
                Dolomite mountains surrounding Cortina d'Ampezzo,
                Italy. Comet Hale-Bopp's blue ion tail, consisting
                of ions from the comet's nucleus, is pushed out
                by the solar wind. The white dust tail is
                composed of larger particles of dust from...`,
            hdurl: "https://apod.nasa.gov/apod/image/2112/halebopp_dimai_960.jpg", 
            url: "https://apod.nasa.gov/apod/image/2112/halebopp_dimai_960.jpg",
        },
    ];
    
    it("correctly renders list of ApodCards", () => 
    {
        render(<ApodList apodList={apod} />);
        
        const actual = screen.getAllByRole("heading").map( (card) => card.textContent ); // user should see two cards/headings
        
        // Note: inline snapshot generated automatically by calling 
        // toMatchInlineSnapshot without arguments.
        // Have to have prettier installed for it to work.
        expect(actual).toMatchInlineSnapshot(`
            Array [
              "2021-12-09 A Total Eclipse of the Sun",
              "2021-12-08 Comet Hale-Bopp Over Val Parola Pass",
            ]
        `);
    });  
    
    it("has empty list when rendered without data", () =>
    {
        render(<ApodList apodList={[]} />);
        
        const actual = screen.getAllByText(/.*/i)[1]; // empty div/list inside body
        
        expect(actual).toBeEmptyDOMElement();
    });
    
});





// it('button click changes props', () => {
//   const { getByText } = render(<App>
//                                 <TestHook />
//                               </App>)

//   expect(getByText(/Moe/i).textContent).toBe("Moe")

//   fireEvent.click(getByText("Change Name"))

//   expect(getByText(/Steve/i).textContent).toBe("Steve")
// })
