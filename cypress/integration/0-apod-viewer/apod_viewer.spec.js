describe("APoD Viewer", () => 
{
    it("loads successfully", () => 
    {
        cy.visit("http://localhost:8080");

        // Hero Section 

        cy.get("header")
            .should("be.visible")
            .within(() => 
            {
                cy.get("p")
                    .should("contain.text","APoD Viewer");
            });

        cy.get("h1").should("contain.text","Astronomy Picture of the Day Viewer");

        // DatePicker Component 
        cy.get("form")
            .should("be.visible")
            .within(() =>
            {
                cy.contains("label", /start date/i)
                    .invoke("attr", "for")
                    .should("equal", "fromDate")
                    .then((id) => 
                    {
                        // note that the last Cypress command inside the `cy.then`
                        // changes the yielded subject to its result 
                        // (i.e., here it's the input itself)
                        cy.get('#' + id)
                    })
                    .should("have.attr", "name", "fromDate");
                
                cy.contains("label", /end date/i)
                    .invoke("attr", "for")
                    .should("equal", "toDate")
                    .then((id) => 
                    {
                        cy.get('#' + id)
                    })
                    .should("have.attr", "name", "toDate");

                // Submit button
                cy.get("button")
                    .should("contain.text", "Submit")
                    .should("not.be.disabled");

            });
        
        // Loading spinner 
        cy.get("[data-testid='loading']").should("be.visible");
        
        // Only one card shown when page loads
        // with todays APoD
        cy.get(".card").should("have.length", 1)
            .within(() =>
            {
                // format all APoD cards display date in (i.e., YYYY-MM-DD )
                const todaysDate = new Date().toLocaleDateString("en-CA"); 

                cy.get("h2 > time")
                    .should("have.attr", "datetime")
                    .and("equal", todaysDate);
            });
              
    });

    it("displays APoDs for entered date range", () =>
    {
        cy.intercept("POST", "/api").as("api");

        cy.get("form").within(() => 
        {
            
            // get 30 days of APoDs, start and end dates inclusive
            cy.get("input[name='fromDate']").type("2021/10/01");
            cy.get("input[name='toDate']").clear().type("2021/10/30");

            cy.root().submit();
        });
        
        cy.wait("@api").then(() =>
        {
            // Could just do assertions on the
            // body of res here. However, we want
            // to accurately assert elements show up
            // on the page, so we'll test it as if 
            // we're an actual user seeing the results
            // of the response.

            cy.get(".card")
                .should("have.length", 30)
                .and("be.visible"); 

            // check that all 30 cards have the correct dates
            cy.get(".card").each((card, i, cardList) =>
            {
                cy.wrap(card)
                    .find("h2 > time")
                    .should("have.attr", "datetime")
                    // Count down from 30, adding a zero
                    // to the day when only a single digit.
                    // (dates displayed in reverse chronological
                    // order, hence the counting down)
                    .and("equal", `2021-10-${ (30 - i) > 9 ? 30 - i : "0" + (30 -i) }`);
            });

        });
    });

    it(`loads more APoDs after scrolling to the bottom of the page
        after entering date range with more than 30 days`, () =>
    {
        cy.intercept("POST", "/api").as("api");

        cy.get("form").within(() => 
        {
            
            // get 61 days worth of APoDs
            cy.get("input[name='fromDate']").clear().type("2021/08/31");
            cy.get("input[name='toDate']").clear().type("2021/10/30");

            cy.root().submit();
        });

        cy.wait("@api").then((interception) => 
        {
            assert.isNotNull(interception.response.body, "1st API call has data");

            // api only sends 30 apods at once,
            // so this num changes on subsequent reqs
            cy.get(".card")
                .should("have.length", 30)
                .and("be.visible"); 

            // check that all 30 cards have the correct dates
            cy.get(".card").each((card, i, cardList) =>
            {
                cy.wrap(card)
                    .find("h2 > time")
                    .should("have.attr", "datetime")
                    // Count down from Oct 30, adding a zero
                    // to the day when only a single digit.
                    // (dates displayed in reverse chronological
                    // order, hence the counting down)
                    .and("equal", `2021-10-${ (30 - i) > 9 ? 30 - i : "0" + (30 -i) }`);
            });

            // load 30 more cards by scrolling to the bottom
            // (our api endpoint only sends back 30 apods
            //  at most at one time)
            cy.scrollTo("bottom");
        });

        cy.wait("@api").then((interception) => 
        {
            assert.isNotNull(interception.response.body, "2nd API call has data");

            cy.get(".card")
                .should("have.length", 60)
                .and("be.visible"); 

            // now just check that first and last cards 
            // are correct dates
            cy.get(".card-container > div:first-child")
                .find("h2 > time")
                .should("have.attr", "datetime")
                .and("equal", "2021-10-30");
            
            cy.get(".card-container > div:last-child")
                .find("h2 > time")
                .should("have.attr", "datetime")
                .and("equal", "2021-09-01");

            
            // Sometimes, the last-child selector selects 
            // the wrong card (second to the last), unless
            // we do the should check for length first. 
            // It's an odd bug, but even without the length 
            // check, the below always returns the current last 
            // card. 
            // cy.get(".card-container > div:nth-of-type(60)")
            //     .find("h2 > time")
            //     .should("have.attr", "datetime")
            //     .and("equal", "2021-09-01");

            // load last APoD
            cy.scrollTo("bottom");
        });

        cy.wait("@api").then((interception) => 
        {
            assert.isNotNull(interception.response.body, "3rd API call has data");

            cy.get(".card")
                .should("have.length", 61)
                .and("be.visible");

            // last test proved the previous dateRange,
            // plus the new one was present. So now
            // we just check last card has correct date.
            cy.get(".card-container > div:last-child")
                .find("h2 > time")
                .should("have.attr", "datetime")
                .and("equal", "2021-08-31");

            // cy.get(".card-container > div:nth-of-type(61)")
            //     .find("h2 > time")
            //     .should("have.attr", "datetime")
            //     .and("equal", "2021-08-31"); 
            
        }); 

    });

    describe("fixed-header", () => 
    {
        context("desktop/tablet view", () => 
        {
            beforeEach(() => 
            {
                // We consider desktop/tablet view 
                // to be anything over 780px in width.
                // The 300px height here is just to 
                // make sure the fixed-header is shown,
                // which is only when the window is 
                // scrolled past the hero section.
                cy.viewport(780, 300);

                // scrollTo bottom again because changing viewport
                // can set view back to top
                cy.scrollTo("bottom");
            });
      
            it("displays fixed-header without mobile menu toggle", () => 
            {
                // display datepicker form itself on desktop view
                cy.get(".header-fixed > .form-container").should("be.visible");
                cy.get(".header-fixed > .hamburger-toggle").should("not.exist");
            });

            it("displays apods for date range entered on fixed-header form", () =>
            {

                cy.intercept("POST", "/api").as("api");

                cy.get(".header-fixed form").within(() => 
                {
                    
                    // get 30 days worth of APoDs
                    cy.get("input[name='fromDate']").clear().type("2021/9/01");
                    cy.get("input[name='toDate']").clear().type("2021/09/30");
        
                    cy.root().submit();
                });

                cy.wait("@api").then((interception) => 
                {
                    assert.isNotNull(interception.response.body, "API call has data");

                    // not needed, but this is
                    // the only way you'll see the
                    // cards if watching the testing 
                    // window.
                    cy.scrollTo("bottom"); 
    
                    cy.get(".card")
                        .should("have.length", 30)
                        .and("be.visible"); 
        
                });
        
            });
        });
      
        context("mobile view", () => 
        {
            beforeEach(() => 
            {
                // run these tests as if in a mobile browser
                // and ensure our responsive UI is correct,
                // 779px being our cutoff for mobile views.
                cy.viewport(779, 600);

                // scrollTo bottom again because changing viewport
                // can set view back to top
                cy.scrollTo("bottom"); 
            })
      
            it("displays mobile menu on click", () => 
            {
                // because the form is now inside mobile menu
                // but only after hamburger toggle
                cy.get(".header-fixed > .form-container").should("not.exist");
                cy.get(".header-fixed > .hamburger-toggle")
                    .should("be.visible")
                    .click();
                
                cy.get(".header-fixed > .mobile-menu").should("be.visible");
                cy.get(".header-fixed > .mobile-menu form").should("be.visible");
            });

            it("displays apods for date range entered inside mobile menu form", () =>
            {
                cy.intercept("POST", "/api").as("api");

                cy.get(".header-fixed > .mobile-menu form").within(() => 
                {
                    
                    // get 30 days worth of APoDs
                    cy.get("input[name='fromDate']").clear().type("2021/08/01");
                    cy.get("input[name='toDate']").clear().type("2021/08/30");
        
                    cy.root().submit();
                });

                cy.wait("@api").then((interception) => 
                {
                    assert.isNotNull(interception.response.body, "API call has data");

                    cy.scrollTo("bottom"); 
    
                    cy.get(".card")
                        .should("have.length", 30)
                        .and("be.visible"); 
        
                });
            });
        })
      })

});