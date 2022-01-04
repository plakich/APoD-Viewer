import DatePicker from "./";
import { render, screen, act } from "@testing-library/react";
import userEvent from '@testing-library/user-event';


function setupDatePicker(isLoading, dateRange)
{
    const startDate = dateRange?.startDate ?? dateRange?.endDate ?? "";
    const endDate = dateRange?.endDate ?? dateRange?.startDate ?? ""; 
    
    const utils =  render(<DatePicker 
                            isLoading={ !!isLoading } 
                            setDateRange={jest.fn()} 
                            dateRange={
                                {
                                    startDate: startDate.toString(), 
                                    endDate: endDate.toString()
                                }} 
                        />);
                    
    const changeStartDate = value => 
         userEvent.type(screen.getByLabelText(/Start Date/i), value);
    
    const changeEndDate = value => 
         userEvent.type(screen.getByLabelText(/End Date/i), value);
         
    return {
        ...utils,
        changeStartDate,
        changeEndDate
    };
}


describe("DatePicker", () =>
{
    
    it("correctly shows only end date if start and end date are the same", () => 
    {
        setupDatePicker(false, 
            {
                startDate: "2021/11/11", 
                endDate: "2021/11/11"
            });
        
        const actualStartDate = screen.getByLabelText(/Start Date/i).value;
        const expectedStartDate = "";
        
        expect(actualStartDate).toBe(expectedStartDate); 
        
        const actualEndDate = screen.getByLabelText(/End Date/i).value;
        const expectedEndDate = "2021/11/11"; 
        
        expect(actualEndDate).toBe(expectedEndDate);
    });  
    
    it("correctly displays start and end dates", () => 
    {
        
        const startDate = "2021/11/01";
        const endDate = "2021/11/11"; 
        
        setupDatePicker(false, {startDate: startDate, endDate: endDate});
        
        const actualStartDate = screen.getByLabelText(/Start Date/i).value;
        const expectedStartDate = startDate;
        
        expect(actualStartDate).toBe(expectedStartDate); 
        
        const actualEndDate = screen.getByLabelText(/End Date/i).value;
        const expectedEndDate = endDate; 
        
        expect(actualEndDate).toBe(expectedEndDate);
    });
    
    it("correctly displays characters user entered for start and end dates", () => 
    {
        
        const {changeStartDate, changeEndDate} = setupDatePicker();
        
        let actualStartDate = screen.getByLabelText(/Start Date/i); //returns live node
        
        let expectedStartDate = "";
        expect(actualStartDate).toHaveValue(expectedStartDate); 
        
        expectedStartDate = '1'; // user types 1
        changeStartDate(expectedStartDate);
        
        expect(actualStartDate).toHaveValue(expectedStartDate); 
        
        
        let actualEndDate = screen.getByLabelText(/End Date/i); 
        
        let expectedEndDate = ""; 
        expect(actualEndDate).toHaveValue(expectedEndDate);
        
        expectedEndDate = "1999/08/09";
        changeEndDate(expectedEndDate);
    
        expect(actualEndDate).toHaveValue(expectedEndDate); 
    });
    
    describe("deleting characters from a datePicker", () =>
    {
        // note: userEvent or jsdom (which userEvent depends on) doesn't set
        // selectionStart or End after using userEvent.type. This is important
        // to test datePicker fully, as it relies on it in its implementation.
        // So tests such as testing 'deleting the second char of YEAR in date
        // string deletes the whole string except for the first char' isn't 
        // possible here, as the test will give a false negative.
        
        test("deleting from YEAR portion of string deletes MONTH and DAY portion too", () =>
        {
            // reminder: if start and end date same, only end date is shown. 
            
            const {changeEndDate} = setupDatePicker(false, {startDate: "1998/12/30"});
            
            const endDate = screen.getByLabelText(/End Date/i); 
            
            expect(endDate).toHaveValue("1998/12/30");
            
            endDate.setSelectionRange(0, 4); 
        
            changeEndDate("{backspace}");
            
            expect(endDate).toHaveValue(""); 
        });
        
        test("deleting from MONTH portion of string deletes DAY portion too", () =>
        {
            // reminder: if start and end date same, only end date is shown. 
            
            const {changeEndDate} = setupDatePicker(false, {startDate: "1998/12/30"});
            
            const endDate = screen.getByLabelText(/End Date/i); 
            
            expect(endDate).toHaveValue("1998/12/30");
            
            endDate.setSelectionRange(5, 7); 
        
            changeEndDate("{backspace}");
            
            expect(endDate).toHaveValue("1998"); 
        });
        
        test("deleting DAY portion of string deletes only DAY portion", () =>
        {
            // reminder: if start and end date same, only end date is shown. 
            
            const {changeEndDate} = setupDatePicker(false, {startDate: "1998/12/30"});
            
            const endDate = screen.getByLabelText(/End Date/i); 
            
            expect(endDate).toHaveValue("1998/12/30");
            
            endDate.setSelectionRange(8, 10); 
        
            changeEndDate("{backspace}");
            
            expect(endDate).toHaveValue("1998/12"); 
        });
    });
    
    describe("displays errors correctly when entering dates with error characters", () =>
    {
        // using test below just because it sounds better
        // to read given the short phrases
        
        test("errors in YEAR part of string", () =>
        {
            const {changeStartDate} = setupDatePicker();
                
            changeStartDate("199P");
            
            let actual = screen.getByLabelText(/Start Date/i);
            let expected = "199"; 
            
            expect(actual).toHaveValue(expected);
            
            // error msg that would show when entering bad 
            // year (e.g., 199P)
            actual = screen.getByText(/YEAR/);
            expected = "There was a problem with the YEAR you entered: 199P";
            
            expect(actual).toHaveTextContent(expected);  
        
        });
        
        test("errors in MONTH part of string", () =>
        {
            const {changeStartDate} = setupDatePicker();
                
            changeStartDate("1997/0Z");
            
            let actual = screen.getByLabelText(/Start Date/i);
            let expected = "1997/0"; 
            
            expect(actual).toHaveValue(expected);
            
            actual = screen.getByText(/MONTH/);
            expected = "There was a problem with the MONTH: 0Z";
            
            expect(actual).toHaveTextContent(expected); 
        });
        
        test("errors in DAY part of string", () =>
        {
            
            const {changeStartDate} = setupDatePicker();
                
            changeStartDate("1997/09/3G");   
            
            let actual = screen.getByLabelText(/Start Date/i);
            let expected = "1997/09/3"; 
            
            expect(actual).toHaveValue(expected);
            
            actual = screen.getByText(/DAY/);
            expected = "There was a problem with the DAY: 3G";
            
            expect(actual).toHaveTextContent(expected); 
        });
        
        
    });
    
    describe("displays errors correctly when entering dates with errors", () =>
    {
        /*
            Errors are distinct from dates with error chars in them. For example, 
            199x has error char 'x' in it, while date range with start date 
            2021/10/10 and end date 2020/08/09 is an error because it's not 
            chronological. Errors of this type are only reported after submitting
            a new date range. 
        */
        
        test("start date errors", () =>
        {
            const {changeStartDate} = setupDatePicker();
            
            changeStartDate("199{enter}");
            
            // not valid, date < 10 chars.
            const actual = screen.getByText(/Start Date is NOT a valid date!/i);
            const expected = "Start Date is NOT a valid date!";
            
            expect(actual).toHaveTextContent(expected);  
        });
        
        test("end date errors", () =>
        {
            const {changeEndDate} = setupDatePicker();
            
            changeEndDate("199{enter}");
            
            // not valid, date < 10 chars.
            const actual = screen.getByText(/End Date is NOT a valid date!/i);
            const expected = "End Date is NOT a valid date!";
            
            expect(actual).toHaveTextContent(expected);  
        });
        
        test("both start and end date have errors", () =>
        {
            const {changeStartDate, changeEndDate} = setupDatePicker();
            
            changeStartDate("199");
            changeEndDate("199{enter}");
            
            // not valid, date < 10 chars.
            const actualStartDate = screen.getByText(/Start Date is NOT a valid date!/i);
            const expectedStartDate = "Start Date is NOT a valid date!"; 
            const actualEndDate = screen.getByText(/End Date is NOT a valid date!/i);
            const expectedEndDate = "End Date is NOT a valid date!";
            
            expect(actualStartDate).toHaveTextContent(expectedStartDate);
            expect(actualEndDate).toHaveTextContent(expectedEndDate);
        });
        
        test("chronology errors", () =>
        {
            const {changeStartDate, changeEndDate} = setupDatePicker(); 
            
            changeStartDate("1998/09/30");
            changeEndDate("1997/07/08{enter}");
    
            const actual = screen.getByText(/Start Date must come before End Date!/i);
            const expected = "Start Date must come before End Date!";
            
            expect(actual).toHaveTextContent(expected);          
        });
        
        test("start date outside range", () =>
        {
            const mockTodaysDate = "2021/01/01"; 
            
            jest.useFakeTimers("modern").setSystemTime(new Date(mockTodaysDate)); 
            
            const {changeStartDate} = setupDatePicker(); 
            
            changeStartDate("1992/09/30{enter}"); // earlier than day of first apod
    
            const actual = screen.getByText(/Start Date must be no earlier than/i);
            const expected = "Start Date must be no earlier than the day of the first APOD 1995/06/16 " +
                "or later than today's date " + mockTodaysDate; 
            
            expect(actual).toHaveTextContent(expected);  
            
            changeStartDate("2021/09/30{enter}"); // later than today's mock date
            
            expect(actual).toHaveTextContent(expected);
            
            jest.useRealTimers(); 
        });
        
        test("end date outside range", () =>
        {
            const mockTodaysDate = "2021/01/01"; 
            
            jest.useFakeTimers("modern").setSystemTime(new Date(mockTodaysDate)); 
            
            const {changeEndDate} = setupDatePicker(); 
            
            changeEndDate("2021/07/08{enter}"); // later than "today's" date 
    
            const actual = screen.getByText(/End Date must be no later than/i);
            const expected = "End date must be no later than today's date " + mockTodaysDate + 
                 " or earlier than the day of the first APOD 1995/06/16";
            
            expect(actual).toHaveTextContent(expected);  
            
            changeEndDate("1995/05/30{enter}"); // earlier than day of first apod
            
            expect(actual).toHaveTextContent(expected);
            
            jest.useRealTimers();         
        });
        
        test("both start and end date outside range", () =>
        {
            
            const mockTodaysDate = "2021/01/01"; 
            
            jest.useFakeTimers("modern").setSystemTime(new Date(mockTodaysDate)); 
            
            const {changeStartDate, changeEndDate} = setupDatePicker(); 
            
            changeStartDate("1994/09/30"); // earlier than first apod
            changeEndDate("2021/07/08{enter}"); // later than "today's" date 
            
            const actualStartDate = screen.getByText(/Start Date must be no earlier than/i);
            const expectedStartDate = "Start Date must be no earlier than the day of the first APOD 1995/06/16 " +
                "or later than today's date " + mockTodaysDate; 
    
            const actualEndDate = screen.getByText(/End Date must be no later than/i);
            const expectedEndDate = "End date must be no later than today's date " + mockTodaysDate + 
                 " or earlier than the day of the first APOD 1995/06/16";
            
            expect(actualStartDate).toHaveTextContent(expectedStartDate); 
            expect(actualEndDate).toHaveTextContent(expectedEndDate);  
            
            jest.useRealTimers();                    
        });
        
        test("one date has error/invalid, the other is outside range", () =>
        {
            const mockTodaysDate = "2021/01/01"; 
            
            jest.useFakeTimers("modern").setSystemTime(new Date(mockTodaysDate)); 
            
            const {changeStartDate, changeEndDate} = setupDatePicker(); 
            
            changeStartDate("199"); // invalid date: date < 10 chars
            changeEndDate("2021/07/08{enter}"); // later than "today's" date 
            
            const actualStartDate = screen.getByText(/Start Date is NOT a valid date!/i);
            const expectedStartDate = "Start Date is NOT a valid date!"; 
    
            const actualEndDate = screen.getByText(/End Date must be no later than/i);
            const expectedEndDate = "End date must be no later than today's date " + mockTodaysDate + 
                 " or earlier than the day of the first APOD 1995/06/16";
            
            expect(actualStartDate).toHaveTextContent(expectedStartDate); 
            expect(actualEndDate).toHaveTextContent(expectedEndDate);  
            
            jest.useRealTimers();          
        });
        
        
            
    });
    
    it("removes error messages after six seconds", () =>
    {
        jest.useFakeTimers();
        jest.spyOn(global, 'setTimeout');    
        
        const {changeStartDate} = setupDatePicker();
            
        changeStartDate("199P");
        
        act(() =>
        {
            jest.advanceTimersByTime(5000);
        });
        
        // error msg that would show when entering bad 
        // year (e.g., 199P)
        const actual = screen.getByText(/YEAR/); 
        
        expect(actual).toBeInTheDocument(); 
        
        act(() =>
        {
            jest.advanceTimersByTime(1000);
        });
        
        expect(actual).not.toBeInTheDocument(); 
        
        jest.useRealTimers();
        
    });
    
    describe("disabling submit button behavior", () =>
    {
        it("disables submit button immediately after submitting a new date", () =>
        {
            
            const {changeStartDate} = setupDatePicker();
                
            const button = screen.getByRole("button"); 
            
            expect(button).not.toBeDisabled(); 
                
            changeStartDate("1998/09/30{enter}");
            
            expect(button).toBeDisabled(); 
        
        });
        
        it("enables button again after new apods are done loading", () =>
        {
            const {rerender, changeStartDate} = setupDatePicker(true); // set loading true
                
            // simulate entering new date and loading new apods
            const button = screen.getByRole("button"); 
                
            changeStartDate("1998/09/30{enter}");
            
            expect(button).toBeDisabled(); 
            
            rerender(<DatePicker 
                    isLoading={false} // done loading
                    setDateRange={jest.fn()} 
                    dateRange={{startDate: "1998/09/30", endDate: ""}} 
                />);
                
            expect(button).not.toBeDisabled(); 
        });   
        
        it("doesn't disable submit button when submitting dates with errors", () => 
        {
            
            const {changeStartDate, changeEndDate} = setupDatePicker();
                
            const button = screen.getByRole("button"); 
                
            // chronology error
            changeStartDate("1998/09/30");
            changeEndDate("1997/07/08{enter}");
                
            expect(button).not.toBeDisabled(); 
            
        });
        
    });
  
});
