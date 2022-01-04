import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as useMediaQuery from "./hooks/useMediaQuery"; 
import App from './App';
import { server } from './mockServer';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());


describe("App", () =>
{
    beforeEach(() => 
    {
        Object.defineProperty(window, 'matchMedia',
        {
            writable: true,
            value: jest.fn().mockImplementation((query) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: jest.fn(), // Deprecated
                removeListener: jest.fn(), // Deprecated
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            })),
        });
    
    });
    
    beforeAll(() =>
    {
        const isDesktop = true;
        
        jest.spyOn(useMediaQuery, "default")
            .mockImplementation( () => isDesktop );
    });
    
    afterAll(() =>
    {
       jest.restoreAllMocks(); 
    });
    
    it('renders App (i.e., Hero, DatePickers, ApodList/Cards', async () => 
    {
        render(<App />);
        
        const linkElement = screen.getByText(/submit/i);
        
        expect(linkElement).toBeInTheDocument(); // Hero/DatePickers rendered
        
        await waitForElementToBeRemoved(() => screen.getByTestId("loading")); // card container/list rendered
        
    });
    
    it("Runs through 'load, fetch, and display apod data in cards' cycle", async () =>
    {
        render(<App />); 
        
        await waitForElementToBeRemoved(() => screen.getByTestId("loading")); // wait for fetched apod data
        
        const cardTitles = screen.getAllByRole("heading", {level: 2 }).map( card => card.textContent ); 
        
        expect(cardTitles).toMatchInlineSnapshot(`
          Array [
            "2021-12-30 The Further Tail of Comet Leonard",
            "2021-12-29 Giant Storms and High Clouds on Jupiter",
            "2021-12-28 Sun Halo over Sweden",
            "2021-12-27 Comet Leonard behind JWST Launch Plume",
            "2021-12-26 James Webb Space Telescope over Earth",
            "2021-12-25 The Tail of a Christmas Comet",
          ]
        `);
    });
    
    it("Displays 500 error on server timeout", async () =>
    {
        render(<App />); 
        
        await waitForElementToBeRemoved(() => screen.getByTestId("loading")); // initial loading
        
        userEvent.clear(screen.getByLabelText(/End Date/i));
        
        // Since we use msw for our mock server, we have to simulate a timeout.
        // We do this by sending a special flagged date below that sends the 
        // error. 
        userEvent.type(screen.getByLabelText(/End Date/i), "1999/12/12{enter}");
        
        await waitForElementToBeRemoved(() => screen.getByTestId("loading")); // wait for fetched apod data
        
        const errorMsg = screen.getByText(/The server/); 
        
        expect(errorMsg).toHaveTextContent("The server encountered a temporary error " +
        "and could not complete your request. Please reload the page and try again.");
        
    });
    
    it("Displays custom error msg for client errors", async () =>
    {
        render(<App />); 
        
        await waitForElementToBeRemoved(() => screen.getByTestId("loading")); // initial loading
        
        userEvent.clear(screen.getByLabelText(/End Date/i));
        
        // Since we use msw for our mock server, we have to simulate errors.
        // We do this by sending a special flagged date below that sends the 
        // custom error message. 
        userEvent.type(screen.getByLabelText(/End Date/i), "1997/11/11{enter}");
        
        await waitForElementToBeRemoved(() => screen.getByTestId("loading")); // wait for fetched apod data
        
        const errorMsg = screen.getByText(/Custom error/); 
        
        expect(errorMsg).toHaveTextContent("Custom error.");
        
    });
});


