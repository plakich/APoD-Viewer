import Hero from "./";
import { render, screen, within } from "@testing-library/react";
import React from "react";
import * as useMediaQuery from "../../hooks/useMediaQuery"; 
import * as useToggle from "../../hooks/useToggle"; 

/*
    Could use these if the values we needed were unchanging. 
    This won't work if we have to change values per test.
    In that case, we must use jest.spyOn(dependency, "nameOfExport").mockImplementationOnce

    jest.mock("../../hooks/useMediaQuery", () =>
        ({
            __esModule: true,
            default: () => false
        })
    );
    
    jest.mock("../../hooks/useToggle", () =>
        ({
            __esModule: true,
            default: () => [false, jest.fn()]
        })
    );

*/

describe("Hero", () =>
{
    describe("Hero in full view, not scrolled", () =>
    {
        
        beforeEach(() =>
        {
            // Mock for useMediaQuery hook used in Hero. We have to mock it this way because
            // JSDOM doesn't have an implementation for it yet. 
            // see: https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
            Object.defineProperty(window, 'matchMedia', { 
                writable: true,
                value: jest.fn().mockImplementation((query) => ({
                    matches: false, // has to be false always (see note below) 
                    media: query,
                    onchange: null,
                    addListener: jest.fn(), // Deprecated
                    removeListener: jest.fn(), // Deprecated
                    addEventListener: jest.fn(),
                    removeEventListener: jest.fn(),
                    dispatchEvent: jest.fn(),
                })),
            });

            // The above mocks the actual implementation of matchMedia.
            // However, we still have to mock the useMediaQuery hook below,
            // which depends on the matches value. If we just set that 
            // to true above and didn't mock useMediaQuery itself, we'd get 
            // an error because we use React's useState to record the current
            // value of matches--and we also are mocking that below. 
             
            const isDesktop = true;
            
            jest.spyOn(useMediaQuery, "default")
                .mockImplementationOnce( () => isDesktop );
                
            
            const isToggled = false; 
                
            jest.spyOn(useToggle, "default")
                .mockImplementationOnce( () => [isToggled, jest.fn()] );
                
            
            const isHeroSet = false;
            const isScrolled = false
            
            jest.spyOn(React, "useState")
                .mockImplementationOnce( () => [isHeroSet, jest.fn()] )
                .mockImplementationOnce( () => [isScrolled, jest.fn()] );
            
        });
        
        afterEach(() => 
        {
            // restore mock to original implementations instead of just 
            // clearing associated mock data. This is crucial for redefining
            // useState mocks between tests. 
            // see: https://stackoverflow.com/questions/64983001/jest-mockimplementationonce-is-not-working-for-2nd-time
            jest.restoreAllMocks(); 
        });
        
        
        it("displays with logo, hero text, and datePickers", () =>
        {
            
            render(<Hero dateRange={{startDate: "1999/09/08", endDate: "2020/10/12"}} 
                        setDateRange={jest.fn()}
                        heroImgUrl={""}
                        isLoading={false} 
                    />);
                    
            const logo = screen.getByText(/Apod Viewer/i); 
            
            expect(logo).toBeInTheDocument();
            
            
            const heroText = screen.getByText(/Astronomy Picture of the Day Viewer/i);
            
            expect(heroText).toBeInTheDocument();
            
            
            const startDateInput = screen.getByLabelText(/Start Date/i); 
            const endDateInput = screen.getByLabelText(/End Date/i); 
            const button = screen.getByRole("button"); 
            
            expect(startDateInput).toBeInTheDocument(); 
            expect(endDateInput).toBeInTheDocument();
            expect(button).toBeInTheDocument();
        
        });
        
        it("sets Hero background image to be empty string", () =>
        {
        
            const {container} = render(
                <Hero dateRange={{startDate: "1999/09/08", endDate: "2020/10/12"}} 
                    setDateRange={jest.fn()}
                    heroImgUrl={null} // url will be undefined until after first api call
                    isLoading={false} 
                />);        
                
            expect(container).toHaveStyle("background-image: ''");
            
        });
        
        it("sets Hero background image to provided url", () =>
        {
            const {container} = render( 
                <Hero dateRange={{startDate: "1999/09/08", endDate: "2020/10/12"}} 
                    setDateRange={jest.fn()}
                    heroImgUrl={"https://mockBackgroundImageUrl.com"} 
                    isLoading={false} 
                />);
                
            expect(container).toHaveStyle("background-image: 'https://mockBackgroundImageUrl.com'");
        });
    });
    
    describe("Scrolled page top to bottom of Hero section, desktop view", () =>
    {
        beforeEach(() =>
        {
            // Mock for useMediaQuery hook used in Hero. We have to mock it this way because
            // JSDOM doesn't have an implementation for it yet. 
            // see: https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
            Object.defineProperty(window, 'matchMedia', { 
                writable: true,
                value: jest.fn().mockImplementation((query) => ({
                    matches: false, // can change this value on a per test basis. No need to remock. 
                    media: query,
                    onchange: null,
                    addListener: jest.fn(), // Deprecated
                    removeListener: jest.fn(), // Deprecated
                    addEventListener: jest.fn(),
                    removeEventListener: jest.fn(),
                    dispatchEvent: jest.fn(),
                })),
            });
            
            const isDesktop = true;
            
            jest.spyOn(useMediaQuery, "default")
                .mockImplementationOnce( () => isDesktop );
                
            
            const isToggled = false; 
                
            jest.spyOn(useToggle, "default")
                .mockImplementationOnce( () => [isToggled, jest.fn()] );
                

            const isScrolled = true;  
            
            jest.spyOn(React, "useState")
                .mockImplementationOnce( () => [isScrolled, jest.fn()] );
            
        });
        
        afterEach(() => 
        {
            // restore mock to original implementations instead of just 
            // clearing associated mock data. This is crucial for redefining
            // useState mocks between tests. 
            // see: https://stackoverflow.com/questions/64983001/jest-mockimplementationonce-is-not-working-for-2nd-time
            jest.restoreAllMocks(); 
        });
        
        it("displays fixed header with a DatePicker component", () =>
        {
                render(
                    <Hero dateRange={{startDate: "1999/09/08", endDate: "2020/10/12"}} 
                        setDateRange={jest.fn()}
                        heroImgUrl={""}
                        isLoading={false} 
                    />);
                    
                const fixedHeader = screen.getByRole("banner"); 
                
                expect(fixedHeader).toHaveClass("header-fixed"); 
                
                // use within because second datePicker with same label is still being rendered
                const startDateInput = within(fixedHeader).getByLabelText(/Start Date/i);
                const endDateInput = within(fixedHeader).getByLabelText(/End Date/i); 
                
                expect(startDateInput).toBeInTheDocument();
                expect(endDateInput).toBeInTheDocument(); 
                
        });
        
    });
    
    describe("Scrolled page top to bottom of Hero section, mobile view", () =>
    {
        beforeEach(() =>
        {
            // Mock for useMediaQuery hook used in Hero. We have to mock it this way because
            // JSDOM doesn't have an implementation for it yet. 
            // see: https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
            Object.defineProperty(window, 'matchMedia', { 
                writable: true,
                value: jest.fn().mockImplementation((query) => ({
                    matches: false, // can change this value on a per test basis. No need to remock. 
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
        
        afterEach(() => 
        {
            // restore mock to original implementations instead of just 
            // clearing associated mock data. This is crucial for redefining
            // useState mocks between tests. 
            // see: https://stackoverflow.com/questions/64983001/jest-mockimplementationonce-is-not-working-for-2nd-time
            jest.restoreAllMocks(); 
        });
        
        it("displays fixed-header with a CLOSED hamburger menu and no DatePicker", () =>
        {
            const isDesktop = false; // mobile view
            
            jest.spyOn(useMediaQuery, "default")
                .mockImplementationOnce( () => isDesktop );
                
            
            const isToggled = false; // so it shows hamburger 
                
            jest.spyOn(useToggle, "default")
                .mockImplementationOnce( () => [isToggled, jest.fn()] );
                
            
            const isScrolled = true;  
            
            jest.spyOn(React, "useState")
                .mockImplementationOnce( () => [isScrolled, jest.fn()] );
                
            render(
                    <Hero dateRange={{startDate: "1999/09/08", endDate: "2020/10/12"}} 
                        setDateRange={jest.fn()}
                        heroImgUrl={""}
                        isLoading={false} 
                    />);
                    
            const fixedHeader = screen.getByRole("banner"); 
            
            expect(fixedHeader).toHaveClass("header-fixed"); 
            
            const hamburger = screen.getByTestId("hamburger-toggle");
            
            expect(hamburger).toBeInTheDocument();
            
            const startDateInput = within(fixedHeader).queryByLabelText(/Start Date/i);
            const endDateInput = within(fixedHeader).queryByLabelText(/End Date/i); 
            
            expect(startDateInput).not.toBeInTheDocument(); // because hamburger menu is closed, so DatePickers aren't shown
            expect(endDateInput).not.toBeInTheDocument();         
        });
        
        it("displays fixed-header with an OPEN/toggled hamburger menu and a DatePicker", () =>
        {
            const isDesktop = false; // mobile view
            
            jest.spyOn(useMediaQuery, "default")
                .mockImplementationOnce( () => isDesktop );
                
            
            const isToggled = true; 
                
            jest.spyOn(useToggle, "default")
                .mockImplementationOnce( () => [isToggled, jest.fn()] ); // mobile menu opened/toggled
                
            
            const isScrolled = true;  
            
            jest.spyOn(React, "useState")
                .mockImplementationOnce( () => [isScrolled, jest.fn()] );
                
            render(
                <Hero dateRange={{startDate: "1999/09/08", endDate: "2020/10/12"}} 
                    setDateRange={jest.fn()}
                    heroImgUrl={""}
                    isLoading={false} 
                />);
                    
            
            
            const hamburger = screen.getByTestId("hamburger-toggle");
            expect(hamburger).toHaveClass("toggled"); 
            
            const fixedHeader = screen.getByRole("banner"); 
            
            const startDateInput = within(fixedHeader).queryByLabelText(/Start Date/i);
            const endDateInput = within(fixedHeader).queryByLabelText(/End Date/i); 
            
            expect(startDateInput).toBeInTheDocument();
            expect(endDateInput).toBeInTheDocument();         
        });
                
    });
    
    
      
   
});